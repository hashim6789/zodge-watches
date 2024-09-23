const ProductModel = require("../../models/Product");
const CategoryModel = require("../../models/Category");
const UserModel = require("../../models/User");
const WishlistModel = require("../../models/Wishlist");
const CartModel = require("../../models/Cart");
const OfferModel = require("../../models/Offer");
const BannerModel = require("../../models/Banner");

// const dummy = async (req, res) => {
//   // const products = await ProductModel.find({ isListed: true });
//   // const categories = await CategoryModel.find({ isListed: true });
//   const user = await UserModel.findOne({
//     email: "muhammedhashim6789@gmail.com",
//   });
//   const address = {
//     userId: "64e61b9d4f60d6c3bca1e97d", // Example ObjectId
//     firstName: "John",
//     phoneNo: "+1234567890",
//     email: "john.doe@example.com",
//     address: "123 Main Street, Apt 4B",
//     pinCode: 123456,
//     state: "California",
//     country: "USA",
//     city: "Los Angeles",
//     flatNo: "4B",
//   };

// console.log(categories);
// res.render("user/account-profile", { user, addresses: [address] });

// res.render("user/home", { products, categories });
// res.render("user/otpGeneratePage", { msg: null });
// };
const user = {
  _id: "66be0418910daec07a9d471f",
  googleId: "111383475093210749540",
  firstName: "Muhammed ",
  lastName: "Hashim PS",
  email: "muhammedhashim6789@gmail.com",
  password: "$2a$10$YtnN54riASIjyLVxWr2r5Obq3Vt9kDvYohOlLjVDpNrNZHIgOx3Bq",
  role: "User",
  isBlocked: false,
  isVerified: true,
  createdAt: "2024-08-15T13:35:20.892Z",
  updatedAt: "2024-08-15T13:35:20.893Z",
  __v: 0,
  thumbnail:
    "https://lh3.googleusercontent.com/a/ACg8ocKT4baXpxa-mFTXXIulJz_DU0pYWn-ZoCoFnNiUgpcgfOwG6g=s96-c",
  resetPasswordExpires: "1723902159187",
  resetPasswordToken: "dafbff5b74e873affb8750845580b1357c3dcff5",
};

const cart = {
  products: [
    {
      productId: "60d21b4667d0d8992e610c85", // Example ObjectId
      name: "Fresh Strawberries",
      price: 36.0,
      quantity: 1,
      image: "/public/user/images/item-cart-04.jpg",
    },
    {
      productId: "60d21b4667d0d8992e610c86", // Example ObjectId
      name: "Lightweight Jacket",
      price: 16.0,
      quantity: 1,
      image: "/public/user/images/item-cart-05.jpg",
    },
  ],
  totalPrice: 52.0,
  updatedAt: new Date(),
  createdAt: new Date(),
  userId: "60d21b4667d0d8992e610c87", // Example ObjectId
};

// const dummy = (req, res) => {
//   res.render("user/cartPage", { user, cart });
// };
const dummy = async (req, res) => {
  const productId = req.params.productId || "66b20c63179e1372e3854593";
  const userId =
    req.session?.user?._id ||
    req.session?.passport?.user?.id ||
    "66ba12a0b60c8ee3d46812fd";
  const user = await UserModel.findById(userId);
  let wishlist = await Wishlists.findOne({ userId });
  const product = await ProductModel.findById(productId);
  res.render("user/newProfile", { user, wishlist, cart });
};

const getHome = async (req, res) => {
  try {
    const userId = req.user?._id;
    let user = null;

    if (userId) {
      user = await UserModel.findById(userId);
    }

    const page = req.query.page || 1;
    const perPage = 8;

    // Fetch products
    const products = await ProductModel.find({ isListed: true })
      .populate("categoryId", "name")
      .skip((page - 1) * perPage)
      .limit(perPage);

    const categories = await CategoryModel.find({ isListed: true });
    const count = await ProductModel.countDocuments();

    const activeOffers = await OfferModel.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    let cart = null;
    let wishlist = null;
    if (userId) {
      cart = await CartModel.findOne({ userId });
      if (!cart) {
        cart = new CartModel({
          userId,
          products: [],
          totalPrice: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        await cart.save();
      }

      wishlist = await WishlistModel.findOne({ userId }).populate(
        "productIds",
        "name price images"
      );
      if (!wishlist) {
        wishlist = new WishlistModel({
          userId,
          productIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        await wishlist.save();
      }
    }

    // Calculate discounted price based on offers
    const productsWithDiscount = products.map((product) => {
      let discountedPrice = product.price;

      // Check if any offers apply to this product
      const applicableOffer = activeOffers.find((offer) => {
        if (
          offer.offerType === "product" &&
          offer.product.toString() === product._id.toString()
        ) {
          return true; // Offer directly applies to the product
        }
        if (
          offer.offerType === "category" &&
          offer.category.toString() === product.categoryId.toString()
        ) {
          return true; // Offer applies to the product's category
        }
        return false;
      });

      // If an applicable offer exists, apply the discount
      if (applicableOffer) {
        discountedPrice =
          product.price -
          (product.price * applicableOffer.discountPercentage) / 100;
      }

      return {
        ...product.toObject(),
        discountedPrice, // Add discounted price to product object
      };
    });
    // console.log(productsWithDiscount);

    const banners = await BannerModel.find({ isActive: true });

    // Render the home page with updated product prices
    res.render("user/home", {
      products: productsWithDiscount, // Send products with discounted prices
      categories,
      current: page,
      user,
      banners,
      wishlist,
      currentCategory: "all",
      pages: Math.ceil(count / perPage),
      cart,
    });
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

const getProductsByPages = async (req, res) => {
  try {
    const category = req.query.category || "all";
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const sortOption = req.query.sort || "newArrivals";
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    let query = { isListed: true };

    if (category !== "all") {
      query.categoryId = category;
    }

    if (searchQuery) {
      query.name = { $regex: new RegExp(searchQuery, "i") };
    }

    let sortCriteria = {};
    // Sorting logic
    switch (sortOption) {
      case "priceLowToHigh":
        sortCriteria = { price: 1 };
        break;
      case "priceHighToLow":
        sortCriteria = { price: -1 };
        break;
      case "lettersAscendingOrder":
        sortCriteria = { name: 1 };
        break;
      case "lettersDescendingOrder":
        sortCriteria = { name: -1 };
        break;
      case "popularity":
        sortCriteria = { soldCount: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 }; // Default to new arrivals
        break;
    }

    // Fetch active offers
    const activeOffers = await OfferModel.find({ isActive: true });

    const products = await ProductModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalProducts = await ProductModel.countDocuments(query);
    const pages = Math.ceil(totalProducts / limit);

    const wishlist = await WishlistModel.findOne({ userId: req.user?._id });

    // Calculate the discounted price for each product based on active offers
    const updatedProducts = products.map((product) => {
      let discountedPrice = product.price; // Default to original price
      let highestDiscountValue = 0; // To track the highest discount value

      // Find applicable offers for the product
      const applicableOffers = activeOffers.filter((offer) => {
        const isCategoryApplicable =
          offer.applicableType === "category" &&
          offer.categoryIds.includes(product.categoryId);
        const isProductApplicable =
          offer.applicableType === "product" &&
          offer.productIds.includes(product._id);
        return isCategoryApplicable || isProductApplicable;
      });

      // Determine the highest discount value among applicable offers
      applicableOffers.forEach((offer) => {
        if (offer.discountValue > highestDiscountValue) {
          highestDiscountValue = offer.discountValue; // Track the highest discount value
        }
      });

      // Calculate the discounted price if there is a discount
      if (highestDiscountValue > 0) {
        discountedPrice = product.price - highestDiscountValue; // Apply the highest flat discount
        // Ensure discountedPrice is not negative
        discountedPrice = Math.max(discountedPrice, 0);
      }

      return {
        ...product,
        discountedPrice:
          discountedPrice < product.price ? discountedPrice : product.price,
        highestDiscountValue, // Include the highest discount value for display
      };
    });

    res.json({
      products: updatedProducts,
      current: page,
      pages,
      wishlist,
      currentCategory: category,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

module.exports = { getHome, getProductsByPages };
