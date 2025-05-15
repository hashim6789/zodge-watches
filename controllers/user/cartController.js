const CartModel = require("../../models/Cart");
const UserModel = require("../../models/User");
const ProductModel = require("../../models/Product");
const WishlistModel = require("../../models/Wishlist");
const OfferModel = require("../../models/Offer");

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
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

//for add to cart the product
const addToCart = async (req, res) => {
  try {
    console.log("testing");
    const userId = req.user?._id;
    const { quantity, productId } = req.body;

    const product = await ProductModel.findById(productId).populate("offers");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
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

    console.log(cart.totalPrice);

    await cart.save();
    req.session.cart = cart;

    console.log("Product added to cart successfully");
    res.status(200).json({
      success: true,
      message: "Product added to cart!",
      cart,
      product: { ...product.toObject(), discountedPrice },
    });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ success: false, message: "Server Error!" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId, changeQuantity } = req.body;
    const userId = req.user?._id;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Cart not found" });
    }

    const productIdx = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIdx === -1) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Product not found in the cart" });
    }

    const newQuantity = cart.products[productIdx].quantity + changeQuantity;

    const product = await ProductModel.findById(productId).populate("offers");
    if (!product) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Product not found" });
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
    console.log("quantity = ", newQuantity);

    console.log("total = ", cart.totalPrice);
    await cart.save();

    return res.status(200).json({
      status: "Success",
      message: "Quantity updated successfully",
      product: cart.products[productIdx],
      cartTotal: cart.totalPrice,
    });
  } catch (err) {
    console.error("Error updating quantity:", err);
    res.status(500).json({ status: "Error", message: "Server Error!" });
  }
};

const deleteCartProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user?._id;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", message: "The cart is not found" });
    }

    const productToDelete = cart.products.find(
      (product) => product.productId.toString() === productId
    );
    if (!productToDelete) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Product not found in the cart" });
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

    console.log("total = ", total);

    cart.totalPrice = total;

    await cart.save();
    req.session.cart = cart;

    return res.status(200).json({
      status: "Success",
      message: "The product is deleted from the cart",
      cart,
    });
  } catch (err) {
    console.error("Error deleting product from cart:", err);
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
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
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  deleteCartProduct,
  postCart,
};
