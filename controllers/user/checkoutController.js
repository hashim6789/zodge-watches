const UserModel = require("../../models/User");
const CartModel = require("../../models/Cart");
const WishlistModel = require("../../models/Wishlist");
const AddressModel = require("../../models/Address");
const ProductModel = require("../../models/Product");
const OrderModel = require("../../models/Order");
const WalletModel = require("../../models/Wallet");

const { createOrder } = require("../../config/razorpayService");
const { v4: uuidv4 } = require("uuid");

const getCheckout = async (req, res) => {
  try {
    const userId = req.user?._id;
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
    console.log("cart = ", cart.products[0]);

    const addresses = await AddressModel.find({ userId });

    // const cartProducts = await ProductModel.find({ _id: { $in: productIds } });
    res.render("user/checkoutPage", { cart, user, wishlist, addresses });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const getAddress = async (req, res) => {
  try {
    const index = req.params.index;
    const user = req.user; // Get the user from request object, adjust according to your middleware
    const userId = req.user._id;
    const addresses = await AddressModel.find({ userId });

    if (user && addresses && addresses[index]) {
      res.json(addresses[index]);
    } else {
      res.status(404).json({ error: "Address not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const postCheckout = async (req, res) => {
  try {
    console.log(req.body);
    // Extract data from the request body
    const { userId, products, address, paymentMethod } = req.body;

    console.log(userId, products, address, paymentMethod);
    // Validate request data
    if (
      !userId ||
      !address.addressLine ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.email ||
      !address.firstName ||
      !address.phoneNo ||
      !paymentMethod
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    // Process the order
    let totalPrice = 0;
    const orderProducts = [];

    for (const product of products) {
      const foundProduct = await ProductModel.findById(product.productId);
      if (!foundProduct || foundProduct.stock < product.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.productId}`,
        });
      }

      totalPrice += foundProduct.price * product.quantity;

      orderProducts.push({
        productId: product.productId,
        quantity: product.quantity,
        price: foundProduct.price,
      });

      //for inventory management
      foundProduct.stock -= product.quantity;
      await foundProduct.save();
    }
    console.log("ordered products = ", orderProducts);

    const newOrder = new OrderModel({
      orderId: generateOrderId(),
      userId,
      products: orderProducts,
      totalPrice,
      orderStatus: "pending",
      address,
      paymentMethod,
    });

    await newOrder.save();
    req.session.orderId = newOrder._id;

    //for clear the products of the cart
    const cart = await CartModel.findOne({ userId });
    cart.products = [];
    await cart.save();
    console.log("order = ", newOrder);

    if (paymentMethod === "cod") {
      res.status(200).json({
        message: "Order placed successfully with cash on delivery!",
        order: newOrder,
      });
    } else if (paymentMethod === "wallet") {
      // Deduct from wallet and confirm the order
      const wallet = await WalletModel.findOne({ userId });

      if (!wallet) {
        return res
          .status(404)
          .json({ success: true, message: "the wallet is not found" });
      }

      if (wallet.balance < totalPrice) {
        return res
          .status(400)
          .json({ message: "Insufficient wallet balance." });
      }
      wallet.balance -= totalPrice;

      wallet.transactions.push({
        type: "debit",
        amount: totalPrice,
        description: `Purchase for order #${newOrder.orderId}`,
      });
      await wallet.save();

      newOrder.orderStatus = "placed";
      newOrder.paymentStatus = "successful";
      newOrder.save();
      return res.status(200).json({
        success: true,
        message: "Order placed successfully using Wallet!",
        order: newOrder,
      });
    } else if (paymentMethod === "onlinePayment") {
      // Create an order with Razorpay
      const options = {
        amount: totalPrice, // Amount in paisa
        currency: "INR",
        receipt: newOrder.orderId,
      };

      // Create Razorpay order
      // Create Razorpay order
      const razorpayOrder = await createOrder(options);
      console.log(razorpayOrder, "ttttt");

      // Save Razorpay order ID to the new order
      newOrder.razorpayOrderId = razorpayOrder.id;
      await newOrder.save();

      // Send Razorpay order details to the frontend
      return res.status(200).json({
        message: "Proceed to payment",
        orderId: newOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID, // Razorpay key ID for frontend use
      });
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const getOrderConfirmation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = await UserModel.findById(userId);
    const wishlist = await WishlistModel.findOne({ userId });
    const cart = await CartModel.findOne({ userId });
    const orderId = req.session?.orderId;
    console.log(orderId);
    const order = await OrderModel.findById(orderId)
      .populate("userId")
      .populate("products.productId");

    console.log(order);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Render the order confirmation page with the order data
    res.render("user/orderConfirmation", { order, user, wishlist, cart });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).send("Internal Server Error");
  }
};
// const ----------------------------------------------------------------------- = async (req, res) => {

// const ----------------------------------------------------------------------- = async (req, res) => {

// const ----------------------------------------------------------------------- = async (req, res) => {

// const ----------------------------------------------------------------------- = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {

// const getDeliveryAddress = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId });
//     const addresses = await AddressModel.find({ userId });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );

//     req.session.steps = ["cart", "checkout"];
//     res.render("user/deliveryAddressPage", {
//       cart,
//       user,
//       addresses,
//       wishlist,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postDeliveryAddress = async (req, res) => {
//   try {
//     const { selectedAddress } = req.body;
//     const Address = await AddressModel.findById(selectedAddress);
//     req.session.selectedAddress = Address;

//     if (!req.session.steps.includes("address")) {
//       req.session.steps.push("address");
//     }

//     res.redirect("/user/shop/payment");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const getPayment = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );
//     req.session.steps = ["cart", "checkout", "address"];

//     res.render("user/paymentMethodsPage", {
//       cart,
//       user,
//       wishlist,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postPayment = async (req, res) => {
//   try {
//     const { selectedPaymentMethod } = req.body;
//     req.session.selectedPaymentMethod = selectedPaymentMethod;

//     if (!req.session.steps.includes("payment")) {
//       req.session.steps.push("payment");
//     }
//     res.redirect("/user/shop/summary");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const getSummary = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );
//     const address = req.session.selectedAddress;
//     const selectedPaymentMethod = req.session.selectedPaymentMethod;
//     const cartProducts = [...req.session.cartProducts];

//     req.session.steps = ["cart", "checkout", "address", "payment"];

//     res.render("user/summaryPage", {
//       cart,
//       user,
//       wishlist,
//       cartProducts,
//       address,
//       selectedPaymentMethod,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postPlaceOrder = async (req, res) => {
//   try {
//     const { _id, userId, updatedAt, createdAt, __v, ...address } =
//       req.session.selectedAddress;

//     const paymentMethod = req.session.selectedPaymentMethod;
//     const totalPrice = req.session.cartProducts[0].totalPrice;
//     const products = [...req.session.cartProducts].map((product) => {
//       return {
//         productId: product.productId,
//         quantity: product.quantity,
//         price: product.productPrice,
//       };
//     });

//     const order = new OrderModel({
//       orderId: generateOrderId(),
//       userId,
//       address,
//       products,
//       totalPrice,
//       orderStatus: "placed",
//       paymentMethod,
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//     });

//     //for inventory management like manage the stock of the corresponding products
//     for (const item of products) {
//       const product = await ProductModel.findById(item.productId);
//       if (!product) {
//         return res
//           .status(404)
//           .json({ status: "Failed", message: "The product is not found" });
//       }
//       product.stock -= item.quantity;
//       product.soldCount += 1;
//       product.save();
//     }

//     //for the cart of the corresponding user in empty
//     const cart = await CartModel.findOne({ userId });
//     if (!cart) {
//       return res
//         .status(404)
//         .json({ status: "Failed", message: "The cart is not found" });
//     }
//     cart.products = [];
//     await cart.save();

//     await order.save();

//     if (!req.session.steps.includes("summary")) {
//       req.session.steps.push("summary");
//     }
//     return res.status(200).redirect("/user/shop/place-order");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const getSuccessPage = (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;

//     // console.log(req.session);
//     req.session.cartProducts = null;
//     req.session.selectedAddress = null;
//     req.session.selectedPaymentMethod = null;
//     req.session.steps = null;

//     req.session.steps = [];
//     return res.status(200).render("user/orderSuccessPage", { orderId });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

function generateOrderId() {
  // Fixed prefix for the order
  const prefix = "ORD";

  // Get the current timestamp in YYYYMMDDHHMMSS format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

  // Generate a UUID and extract the first 4 alphanumeric characters
  const uuidSegment = uuidv4()
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();

  // Combine all parts to form the order ID
  return `${prefix}${timestamp}${uuidSegment}`;
}

module.exports = {
  getCheckout,
  getAddress,
  postCheckout,
  getOrderConfirmation,
};
