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
    const cart = await CartModel.findOne({ userId }) // Find cart by user ID
      .populate({
        path: "products.productId", // Populate the productId field in products array
        select: "_id name images stock", // Specify which fields to include from Products
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

    // Fetch the product along with the offers
    const product = await ProductModel.findById(productId).populate("offers");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    let discountedPrice = product.price;

    // If the product has associated offers, apply the highest discount
    if (product.offers && product.offers.length > 0) {
      const activeOffers = product.offers.filter((offer) => offer.isActive);

      if (activeOffers.length > 0) {
        // Get the highest discount value from the offers
        const highestOffer = activeOffers.reduce((max, offer) =>
          offer.discountValue > max.discountValue ? offer : max
        );

        // Apply the discount from the highest offer
        discountedPrice = product.price - highestOffer.discountValue;
        discountedPrice = Math.max(discountedPrice, 0); // Ensure the price is not negative
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

    // Update the cart with the new product or update the quantity of an existing product
    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (existingProductIndex > -1) {
      // If the product is already in the cart, update the quantity and adjust the total price
      const previousQuantity = cart.products[existingProductIndex].quantity;
      cart.products[existingProductIndex].quantity = quantity;
      cart.totalPrice += discountedPrice * (quantity - previousQuantity);
    } else {
      // If the product is not in the cart, add it and update the total price
      cart.products.push({
        productId: productId,
        quantity: quantity,
        price: discountedPrice, // Save the discounted price
      });
      cart.totalPrice += discountedPrice * quantity;
    }

    console.log(cart.totalPrice);

    // Save the updated cart
    await cart.save();
    req.session.cart = cart;

    console.log("Product added to cart successfully");
    res.status(200).json({
      success: true,
      message: "Product added to cart!",
      cart,
      product: { ...product.toObject(), discountedPrice }, // Include the discounted price in the response
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

    // Fetch the user's cart
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Cart not found" });
    }

    // Find the product in the cart
    const productIdx = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIdx === -1) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Product not found in the cart" });
    }

    // Calculate new quantity
    const newQuantity = cart.products[productIdx].quantity + changeQuantity;

    // Fetch the product along with its offers
    const product = await ProductModel.findById(productId).populate("offers");
    if (!product) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Product not found" });
    }

    // Determine discounted price based on active offers
    let discountedPrice = product.price;
    if (product.offers && product.offers.length > 0) {
      const activeOffers = product.offers.filter((offer) => offer.isActive);
      if (activeOffers.length > 0) {
        const highestOffer = activeOffers.reduce((max, offer) =>
          offer.discountValue > max.discountValue ? offer : max
        );
        discountedPrice = product.price - highestOffer.discountValue;
        discountedPrice = Math.max(discountedPrice, 0); // Ensure the price is not negative
      }
    }

    // Recalculate total price for the cart
    // cart.totalPrice =
    //   cart.totalPrice -
    //   cart.products[productIdx].price * cart.products[productIdx].quantity +
    //   discountedPrice * cart.products[productIdx].quantity;
    // cart.products[productIdx].price = discountedPrice; // Update price in the cart

    cart.totalPrice =
      cart.totalPrice -
      discountedPrice * cart.products[productIdx].quantity +
      discountedPrice * newQuantity;
    if (newQuantity <= 0) {
      cart.products[productIdx].quantity = 1; // Set to minimum 1 if quantity is <= 0
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

    // Fetch the user's cart
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", message: "The cart is not found" });
    }

    // Filter out the product to be deleted
    const productToDelete = cart.products.find(
      (product) => product.productId.toString() === productId
    );
    if (!productToDelete) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Product not found in the cart" });
    }

    // Remove the product from the cart
    cart.products = cart.products.filter(
      (product) => product.productId.toString() !== productId
    );

    // Recalculate total price for the cart
    let total = 0;
    for (const currProduct of cart.products) {
      const product = await ProductModel.findById(
        currProduct.productId
      ).populate("offers");
      if (!product) {
        throw new Error(`Product with ID ${currProduct.productId} not found`);
      }

      // Determine discounted price based on active offers
      let discountedPrice = product.price;
      if (product.offers && product.offers.length > 0) {
        const activeOffers = product.offers.filter((offer) => offer.isActive);
        if (activeOffers.length > 0) {
          const highestOffer = activeOffers.reduce((max, offer) =>
            offer.discountValue > max.discountValue ? offer : max
          );
          discountedPrice = product.price - highestOffer.discountValue;
          discountedPrice = Math.max(discountedPrice, 0); // Ensure the price is not negative
        }
      }

      total += discountedPrice * currProduct.quantity;
    }

    console.log("total = ", total);

    // Update cart details
    cart.totalPrice = total;

    // Save the updated cart
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
    // console.log(userId);
    const cart = await CartModel.findOne({ userId });
    // .populate("products.productId", "_id name images price stock")
    // .exec();
    // console.log(cart);

    // After populating, you may need to map over `cart.products` to construct the desired structure:
    // const cartProducts = cart.products.map((product) => ({
    //   name: product.productId.name,
    //   images: product.productId.images,
    //   _id: product.productId._id,
    //   price: product.productId.price,
    //   quantity: product.quantity,
    //   stock: product.productId.stock,
    // }));

    // req.session.cartProducts = [...cartProducts];
    req.session.cart = cart;
    console.log("session = ", req.session.cart.products);
    // if (!req.session.steps) {
    //   req.session.steps = [];
    // }
    // if (!req.session.steps.includes("cart")) {
    //   req.session.steps.push("cart");
    // }

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
