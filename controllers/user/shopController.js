const ProductModel = require("../../models/Product"); // Adjust the path as needed
const CategoryModel = require("../../models/Category");
const CartModel = require("../../models/Cart");
const UserModel = require("../../models/User");
const AddressModel = require("../../models/Address");
const OrderModel = require("../../models/Order");
const WishlistModel = require("../../models/Wishlist");

const { v4: uuidv4 } = require("uuid");

//for rendering the quick view (Product details page);
const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user?._id;
    let user = null;
    let cart = null;
    let wishlist = null;
    if (userId) {
      user = await UserModel.findById(userId);
      cart = await CartModel.findOne({ userId });
      wishlist = await WishlistModel.findOne({ userId }).populate(
        "productIds",
        "name price images"
      );
    }
    const product = await ProductModel.findById(productId);
    res.render("user/quickview", { product, ratings: 4, user, wishlist, cart });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server error");
  }
};

//for get the images of the corresponding products
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
  getProductDetails,
  getImage,
  filterCategoryProduct,
  filterAllProducts,
  searchProducts,
};
