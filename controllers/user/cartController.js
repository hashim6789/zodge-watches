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
    const userId = req.user?._id;
    const { quantity, productId } = req.body;

    // Fetch the product
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    // Fetch active offers for the product's category
    const activeOffers = await OfferModel.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
      categoryId: product.categoryId,
    });

    // Calculate the discounted price
    let discountedPrice = product.price;
    if (activeOffers.length > 0) {
      const highestOffer = activeOffers.reduce((max, offer) =>
        offer.discountValue > max.discountValue ? offer : max
      );

      if (highestOffer.discountType === "percentage") {
        discountedPrice =
          product.price - (product.price * highestOffer.discountValue) / 100;
      } else if (highestOffer.discountType === "flat") {
        discountedPrice = product.price - highestOffer.discountValue;
      }

      // Ensure discountedPrice is not negative
      discountedPrice = Math.max(discountedPrice, 0);
    }
    console.log("discount = ", discountedPrice);

    // Fetch the cart for the user
    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({
        userId: userId,
        products: [],
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Update cart with the new product
    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (existingProductIndex > -1) {
      const previousQuantity = cart.products[existingProductIndex].quantity;
      cart.products[existingProductIndex].quantity = quantity;
      if (discountedPrice !== 0) {
        cart.totalPrice += discountedPrice * (quantity - previousQuantity);
      } else {
        cart.totalPrice += product.price * (quantity - previousQuantity);
      }
    } else {
      if (discountedPrice !== 0) {
        cart.products.push({
          productId: productId,
          quantity: quantity,
          price: discountedPrice, // Save the discounted price
        });
        cart.totalPrice += discountedPrice * quantity;
      } else {
        cart.products.push({
          productId: productId,
          quantity: quantity,
          price: product.price, // Save the discounted price
        });
        cart.totalPrice += product.price * quantity;
      }
    }

    await cart.save();
    req.session.cart = cart;

    console.log("Product added to cart successfully");
    res.status(200).json({
      success: true,
      message: "Product added to cart!",
      cart,
      product: { ...product.toObject(), discountedPrice }, // Include discountedPrice in response
    });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ success: false, message: "Server Error!!!" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId, changeQuantity, totalPrice } = req.body;
    const userId = req.user?._id;
    console.log(totalPrice);

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", message: "The cart is not found" });
    }

    const productIdx = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIdx === -1) {
      return res.status(404).json({
        status: "Failed",
        message: "The product is not found in the cart",
      });
    }

    cart.products[productIdx].quantity += changeQuantity;

    // const total = await cart.products.reduce(
    //   async (totalPromise, currProduct) => {
    //     const total = await totalPromise;
    //     const product = await ProductModel.findById(currProduct.productId);

    //     if (!product) {
    //       throw new Error(`Product with ID ${currProduct.productId} not found`);
    //     }

    //     return total + product.price * currProduct.quantity;
    //   },
    //   Promise.resolve(0)
    // );

    cart.totalPrice = totalPrice;

    cart.updatedAt = Date.now();
    await cart.save();

    req.session.cart = cart;

    return res.status(200).json({
      status: "Success",
      message: "The quantity is updated",
      product: cart.products[productIdx],
      cartTotal: cart.totalPrice,
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

//for deleting the cart products
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
    console.log(productId, userId);
    console.log("cart = ", cart);

    cart.products = cart.products.filter(
      (product) => product.productId.toString() !== productId
    );

    const total = await cart.products.reduce(
      async (totalPromise, currProduct) => {
        const total = await totalPromise;
        const product = await ProductModel.findById(currProduct.productId);

        if (!product) {
          throw new Error(`Product with ID ${currProduct.productId} not found`);
        }

        return total + product.price * currProduct.quantity;
      },
      Promise.resolve(0)
    );

    cart.totalPrice = total;
    cart.updatedAt = Date.now();

    await cart.save();

    req.session.cart = cart;

    return res.status(200).json({
      status: "Success",
      message: "The product is deleted from the cart",
      cart,
    });
  } catch (err) {
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
