const Razorpay = require("razorpay");
const crypto = require("crypto");
const OrderModel = require("../models/Order");
const ProductModel = require("../models/Product");

const { sendOrderConfirmationEmail } = require("../utils/emailSender");

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to verify payment signature
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, paymentId, signature } = req.body;

    console.log({ orderId, razorpayOrderId, paymentId, signature });

    const order = await OrderModel.findById(orderId);
    if (!order || order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ message: "Invalid Order." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed." });
    }

    order.paymentMethod = "onlinePayment";
    order.paymentStatus = "successful";
    order.orderStatus = "placed";
    await order.save();

    await finalizeStockReduction(order.products);
    await sendOrderConfirmationEmail(order);

    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error!!!" });
  }
};

const createOrder = async (option) => {
  const options = {
    amount: option.amount * 100,
    currency: option.currency,
    receipt: option.receipt,
    payment_capture: 1,
  };
  return await razorpayInstance.orders.create(options);
};

const finalizeStockReduction = async (orderProducts) => {
  for (const product of orderProducts) {
    const foundProduct = await ProductModel.findById(product.productId);
    if (foundProduct) {
      foundProduct.reservedStock -= product.quantity;
      await foundProduct.save();
    }
  }
};

module.exports = { createOrder, verifyPayment };
