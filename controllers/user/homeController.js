const ProductModel = require("../../models/Product");
const CategoryModel = require("../../models/Category");
const UserModel = require("../../models/User");
const WishlistModel = require("../../models/Wishlist");
const CartModel = require("../../models/Cart");
const OfferModel = require("../../models/Offer");
const BannerModel = require("../../models/Banner");
const CouponModel = require("../../models/Coupon");

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

    const categories = await CategoryModel.find({ isListed: true });

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

    const banners = await BannerModel.find({ isActive: true });
    const offers = await OfferModel.find({ isActive: true });
    const coupons = await CouponModel.find({ isListed: true });

    res.render("user/home", {
      categories,
      user,
      banners,
      offers,
      coupons,
      wishlist,
      currentCategory: "all",
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
        sortCriteria = { createdAt: -1 };
        break;
    }

    const activeOffers = await OfferModel.find({ isActive: true });

    const products = await ProductModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalProducts = await ProductModel.countDocuments(query);
    const pages = Math.ceil(totalProducts / limit);

    const wishlist = await WishlistModel.findOne({ userId: req.user?._id });

    const updatedProducts = products.map((product) => {
      let discountedPrice = product.price;
      let highestDiscountValue = 0;

      const applicableOffers = activeOffers.filter((offer) => {
        const isCategoryApplicable =
          offer.applicableType === "category" &&
          offer.categoryIds.includes(product.categoryId);
        const isProductApplicable =
          offer.applicableType === "product" &&
          offer.productIds.includes(product._id);
        return isCategoryApplicable || isProductApplicable;
      });

      applicableOffers.forEach((offer) => {
        if (offer.discountValue > highestDiscountValue) {
          highestDiscountValue = offer.discountValue;
        }
      });

      if (highestDiscountValue > 0) {
        discountedPrice = product.price - highestDiscountValue;
        discountedPrice = Math.max(discountedPrice, 0);
      }

      return {
        ...product,
        discountedPrice:
          discountedPrice < product.price ? discountedPrice : product.price,
        highestDiscountValue,
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
