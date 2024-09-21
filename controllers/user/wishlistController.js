const WishlistModel = require("../../models/Wishlist");
const ProductModel = require("../../models/Product");

//for adding a product into a wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "Error", message: "Product not found!" });
    }

    let wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) {
      wishlist = new WishlistModel({
        userId,
        productIds: [],
      });
    }

    if (!wishlist.productIds.includes(productId)) {
      wishlist.productIds.push(productId);
    } else {
      return res.status(404).json({
        success: false,
        message: "Product already in wishlist",
      });
    }
    wishlist.save();
    return res.status(201).json({
      success: true,
      message: "The product is added to the wishlist successfully",
      data: {
        wishlistLength: wishlist.productIds.length,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error!!!",
    });
  }
};

//remove product from a wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const productId = req.params.productId;

    const product = await ProductModel.findById(productId);
    // console.log(product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "The wishlist is not found",
      });
    }

    const index = wishlist.productIds.indexOf(productId);
    if (index > -1) {
      wishlist.productIds.splice(index, 1);
    } else {
      return res.json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    wishlist.save();
    res.status(200).json({
      success: true,
      message: "The product is removed from the wishlist",
      data: {
        wishlistLength: wishlist.productIds.length,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error!!!",
    });
  }
};

// Express.js example
const fetchWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );
    // console.log(wishlist);
    res.json({ wishlist });
  } catch (error) {
    // console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

module.exports = { addToWishlist, removeFromWishlist, fetchWishlist };
