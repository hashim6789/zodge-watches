const WishlistModel = require("../../models/Wishlist");
const ProductModel = require("../../models/Product");
const OfferModel = require("../../models/Offer");

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

const fetchWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Populate productIds first, then populate offers for each product
    const wishlist = await WishlistModel.findOne({ userId }).populate({
      path: "productIds",
      select: "name price images offers categoryId", // Select the fields you need
      populate: {
        path: "offers", // Populate offers inside each product
        select: "discountValue isActive", // Select the relevant fields from offers
      },
    });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const productsWithDiscounts = wishlist.productIds.map((product) => {
      // Determine discounted price based on active offers
      let discountedPrice = product.price;

      if (product.offers && product.offers.length > 0) {
        // Filter for active offers
        const activeOffers = product.offers.filter((offer) => offer.isActive);

        if (activeOffers.length > 0) {
          // Find the highest offer
          const highestOffer = activeOffers.reduce((max, offer) =>
            offer.discountValue > max.discountValue ? offer : max
          );

          // Calculate discounted price
          discountedPrice -= highestOffer.discountValue;
          discountedPrice = Math.max(discountedPrice, 0); // Ensure not negative
        }
      }

      return {
        productId: product._id,
        name: product.name,
        images: product.images,
        discountedPrice,
      };
    });

    res.status(200).json({ wishlist: productsWithDiscounts });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

module.exports = { addToWishlist, removeFromWishlist, fetchWishlist };
