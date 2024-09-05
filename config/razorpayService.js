const Razorpay = require("razorpay");

const crypto = require("crypto");
const OrderModel = require("../models/Order");
const ProductModel = require("../models/Product");

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to verify payment signature
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, paymentId, signature } = req.body;

    console.log(orderId, razorpayOrderId, paymentId, signature);

    // Fetch the order from the database
    const order = await OrderModel.findById(orderId);
    if (!order || order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ message: "Invalid Order." });
    }

    // Generate the signature using the key secret
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest("hex");

    // Compare the generated signature with the one sent from Razorpay
    if (generatedSignature !== signature) {
      return res.status(400).json({ message: "Payment verification failed." });
    }

    // Update the order status to 'paid'
    order.paymentStatus = "successful";
    await order.save();

    // Finalize stock deduction
    for (const product of order.products) {
      const foundProduct = await ProductModel.findById(product.productId);
      if (foundProduct) {
        foundProduct.stock -= product.quantity;
        await foundProduct.save();
      }
    }

    // Send success response
    res.status(200).json({ message: "Payment verified successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
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

module.exports = { createOrder, verifyPayment };
