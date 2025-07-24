const CartModel = require("../../models/Cart");
const UserModel = require("../../models/User");
const ProductModel = require("../../models/Product");
const WishlistModel = require("../../models/Wishlist");
const OfferModel = require("../../models/Offer");
const HttpStatusCode = require("../../constants/httpStatusCode");
const HttpStatus = require("../../constants/httpStatus");
const HttpResponseMessage = require("../../constants/httpResponseMessage");

//for user cart page
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId }).populate({
      path: "products.productId",
      select: "_id name images stock",
    });
    const wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );
    res.render("user/cartPage", { cart, user, wishlist });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

//for add to cart the product
const addToCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { quantity, productId } = req.body;

    const product = await ProductModel.findById(productId).populate("offers");

    if (!product) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: HttpResponseMessage.ERROR.PRODUCT_NOT_FOUND,
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

    // Fetch the user's cart
    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({
        userId: userId,
        products: [],
        totalPrice: 0,
      });
    }

    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (existingProductIndex > -1) {
      const previousQuantity = cart.products[existingProductIndex].quantity;
      cart.products[existingProductIndex].quantity = quantity;
      cart.totalPrice += discountedPrice * (quantity - previousQuantity);
    } else {
      cart.products.push({
        productId: productId,
        quantity: quantity,
        price: discountedPrice,
      });
      cart.totalPrice += discountedPrice * quantity;
    }

    await cart.save();
    req.session.cart = cart;

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: HttpResponseMessage.SUCCESS.PRODUCT_ADDED_TO_CART,
      cart,
      product: { ...product.toObject(), discountedPrice },
    });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId, changeQuantity } = req.body;
    const userId = req.user?._id;

    if (changeQuantity !== 1 && changeQuantity !== -1) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.INVALID_CREDENTIALS,
      });
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.CART_NOT_FOUND,
      });
    }

    const productIdx = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIdx === -1) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.PRODUCT_NOT_FOUND_ON_CART,
      });
    }

    const newQuantity = cart.products[productIdx].quantity + changeQuantity;

    if (newQuantity > 3) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.MAXIMUM_QUANTITY_OVER,
      });
    }
    const product = await ProductModel.findById(productId).populate("offers");
    if (!product) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.PRODUCT_NOT_FOUND,
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

    cart.totalPrice =
      cart.totalPrice -
      discountedPrice * cart.products[productIdx].quantity +
      discountedPrice * newQuantity;
    if (newQuantity <= 0) {
      cart.products[productIdx].quantity = 1;
    } else {
      cart.products[productIdx].quantity = newQuantity;
    }
    await cart.save();

    return res.status(HttpStatusCode.OK).json({
      status: HttpStatus.SUCCESS,
      message: HttpResponseMessage.SUCCESS.PRODUCT_QUANTITY_UPDATE,
      product: cart.products[productIdx],
      cartTotal: cart.totalPrice,
    });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

const deleteCartProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user?._id;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.CART_NOT_FOUND,
      });
    }

    const productToDelete = cart.products.find(
      (product) => product.productId.toString() === productId
    );
    if (!productToDelete) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.PRODUCT_NOT_FOUND_ON_CART,
      });
    }

    cart.products = cart.products.filter(
      (product) => product.productId.toString() !== productId
    );

    let total = 0;
    for (const currProduct of cart.products) {
      const product = await ProductModel.findById(
        currProduct.productId
      ).populate("offers");
      if (!product) {
        throw new Error(`Product with ID ${currProduct.productId} not found`);
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

      total += discountedPrice * currProduct.quantity;
    }

    cart.totalPrice = total;

    await cart.save();
    req.session.cart = cart;

    return res.status(HttpStatusCode.OK).json({
      status: HttpStatus.SUCCESS,
      message: HttpResponseMessage.SUCCESS.PRODUCT_DELETED_FROM_CART,
      cart,
    });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

//proceed to checkout
const postCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const cart = await CartModel.findOne({ userId });
    req.session.cart = cart;
    res.redirect("/checkout");
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  deleteCartProduct,
  postCart,
};
