const ProductModel = require("../../models/Product"); // Adjust the path as needed
const CategoryModel = require("../../models/Category");
const CartModel = require("../../models/Cart");
const UserModel = require("../../models/User");
const AddressModel = require("../../models/Address");
const OrderModel = require("../../models/Order");
const WishlistModel = require("../../models/Wishlist");
const OfferModel = require("../../models/Offer");

const { v4: uuidv4 } = require("uuid");

const getShop = async (req, res) => {
  try {
    const userId = req.user?._id;
    let user = null;

    if (userId) {
      user = await UserModel.findById(userId);
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = 8;

    const activeOffers = await OfferModel.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).populate("categoryId", "name");

    const products = await ProductModel.find({ isListed: true })
      .populate("categoryId", "name")
      .skip((page - 1) * perPage)
      .limit(perPage);

    const categories = await CategoryModel.find({ isListed: true });
    const count = await ProductModel.countDocuments();

    const productsWithDiscount = products.map((product) => {
      let discountedPrice = product.price;
      const applicableOffers = activeOffers.filter((offer) =>
        offer.categoryId.equals(product.categoryId._id)
      );

      if (applicableOffers.length > 0) {
        const highestOffer = applicableOffers.reduce((max, offer) =>
          offer.discountValue > max.discountValue ? offer : max
        );

        if (highestOffer.discountType === "percentage") {
          discountedPrice =
            product.price - (product.price * highestOffer.discountValue) / 100;
        } else if (highestOffer.discountType === "flat") {
          discountedPrice = product.price - highestOffer.discountValue;
        }

        discountedPrice = Math.max(discountedPrice, 0);
      }

      return {
        ...product.toObject(),
        discountedPrice,
      };
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

    res.render("user/shop", {
      products: productsWithDiscount,
      categories,
      current: page,
      user,
      wishlist,
      currentCategory: "all",
      pages: Math.ceil(count / perPage),
      cart,
    });
  } catch (err) {
    console.error("Error fetching shop data:", err);
    res.status(500).json({
      status: "Error",
      message: "The server encountered an error",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user?._id;

    const product = await ProductModel.findById(productId).populate({
      path: "offers",
      match: { isActive: true },
    });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    let discountedPrice = product.price;

    if (product.offers.length > 0) {
      const highestOffer = product.offers.reduce((max, offer) =>
        offer.discountValue > max.discountValue ? offer : max
      );

      discountedPrice -= highestOffer.discountValue;

      discountedPrice = Math.max(discountedPrice, 0);
    }

    console.log("Discounted price = ", discountedPrice);

    let userData = { user: null, cart: null, wishlist: null };
    if (userId) {
      userData.user = await UserModel.findById(userId);
      userData.cart = await CartModel.findOne({ userId });
      userData.wishlist = await WishlistModel.findOne({ userId }).populate(
        "productIds",
        "name price images"
      );
    }

    res.render("user/quickView", {
      product,
      discountedPrice,
      averageRating: 4,
      ratings: 4,
      ...userData,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Server error");
  }
};

const getImage = async (req, res) => {
  try {
    const index = parseInt(req.query.index, 10);
    const productId = req.query.id;

    const product = await ProductModel.findById(productId);
    if (product) {
      if (isNaN(index) || index < 0 || index >= product.images.length) {
        return res.status(400).json({ error: "Invalid index" });
      }
      return res
        .status(200)
        .json({ src: `/public/uploads/${product.images[index]}` });
    } else {
      return res.status(404).json({
        status: "Failed",
        message: "The product doesn't exist",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "Server error!!!",
    });
  }
};

//for filtering the products by categories
const filterCategoryProduct = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    let products = [];
    const category = await CategoryModel.findById(categoryId);
    if (category) {
      products = await ProductModel.find({ categoryId, isListed: true });
      console.log("products");

      if (products) {
        return res.status(200).json({
          status: "Success",
          message: "The products successfully fetched...",
          data: products,
        });
      }
    }
    res.status(404).json({
      status: "Failure",
      message: " The category doesn't exists",
    });
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error!!!",
    });
  }
};

//for get the products of all without filtering the categories
const filterAllProducts = async (req, res) => {
  try {
    const userId = req.session?.passport?.user?.id || req.session?.user?._id;
    let wishlist = null;
    if (userId) {
      wishlist = await WishlistModel.findOne({ userId });
    }
    const method = req.query.method;
    let products = [];

    if (method === "priceLowToHigh") {
      products = await ProductModel.find({ isListed: true })
        .sort({ price: 1 })
        .limit(8);
    } else if (method === "priceHighToLow") {
      products = await ProductModel.find({ isListed: true })
        .sort({ price: -1 })
        .limit(8);
    } else if (method === "lettersAscendingOrder") {
      products = await ProductModel.find({ isListed: true })
        .sort({ name: 1 })
        .limit(8);
    } else if (method === "lettersDescendingOrder") {
      products = await ProductModel.find({ isListed: true })
        .sort({ name: -1 })
        .limit(8);
    } else if (method === "popularity") {
      products = await ProductModel.find({ isListed: true })
        .sort({ soldCount: -1 })
        .limit(8);
    } else if (method === "newArrivals") {
      products = await ProductModel.find({ isListed: true })
        .sort({ createdAt: -1 })
        .limit(8);
    }

    if (products.length > 0) {
      res.status(200).json({
        status: "Success",
        message: "The products successfully fetched...",
        data: { products, wishlist },
      });
    } else {
      res.status(404).json({
        status: "Failure",
        message: " The products exists",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The serverrrr error!!!",
    });
  }
};

//search products
const searchProducts = async (req, res) => {
  try {
    const query = req.query.query;

    const products = await ProductModel.find({
      name: { $regex: query, $options: "i" },
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error searching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Error searching products" });
  }
};

// }

module.exports = {
  getShop,
  getProductDetails,
  getImage,
  filterCategoryProduct,
  filterAllProducts,
  searchProducts,
};
