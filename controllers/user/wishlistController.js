const WishlistModel = require("../../models/Wishlist");
const ProductModel = require("../../models/Product");
const OfferModel = require("../../models/Offer");
const CartModel = require("../../models/Cart");

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

//for add to cart product fron the wishlist
const addToCartFromWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const productId = req.params.productId;

    const product = await ProductModel.findById(productId).populate("offers");

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
      await wishlist.save();
    } else {
      return res.json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    let discountedPrice = product.price;

    if (product.offers && product.offers.length > 0) {
      const activeOffers = product.offers.filter((offer) => offer.isActive);
      if (activeOffers.length > 0) {
        const highestOffer = activeOffers.reduce((max, offer) =>
          offer.discountValue > max.discountValue ? offer : max
        );
        discountedPrice = product.price - highestOffer.discountValue;
        discountedPrice = Math.max(discountedPrice, 0);
      }
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({ userId, products: [], totalPrice: 0 });
    }

    const cartProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (cartProductIndex !== -1) {
      cart.products[cartProductIndex].quantity += 1;
    } else {
      cart.products.push({
        productId: productId,
        quantity: 1,
        price: discountedPrice,
      });
    }

    cart.totalPrice += discountedPrice;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "The product is removed from the wishlist and added to the cart",
      data: {
        product: { ...product.toObject(), discountedPrice },
        cart,
        wishlistLength: wishlist.productIds.length,
        cartProductsLength: cart.products.length,
      },
    });
  } catch (err) {
    console.error("Error in addToCartFromWishlist:", err);
    res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
};

const fetchWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;

    const wishlist = await WishlistModel.findOne({ userId }).populate({
      path: "productIds",
      select: "name price images offers categoryId",
      populate: {
        path: "offers",
        select: "discountValue isActive",
      },
    });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const productsWithDiscounts = wishlist.productIds.map((product) => {
      let discountedPrice = product.price;

      if (product.offers && product.offers.length > 0) {
        const activeOffers = product.offers.filter((offer) => offer.isActive);

        if (activeOffers.length > 0) {
          const highestOffer = activeOffers.reduce((max, offer) =>
            offer.discountValue > max.discountValue ? offer : max
          );

          discountedPrice -= highestOffer.discountValue;
          discountedPrice = Math.max(discountedPrice, 0);
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

module.exports = {
  addToWishlist,
  removeFromWishlist,
  addToCartFromWishlist,
  fetchWishlist,
};
