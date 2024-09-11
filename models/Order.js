const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    products: [
      {
        price: { type: Number, required: true },
        productId: { type: Types.ObjectId, required: true, ref: "Products" },
        quantity: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "pending",
        "failed",
        "placed",
        "shipped",
        "cancelled",
        "delivered",
        "returned",
      ],
    },
    userId: { type: Types.ObjectId, required: true, ref: "Users" },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["wallet", "cod","onlinePayment" ],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    walletUsed: { type: Boolean, default: false },
    address: {
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      email: { type: String, required: true },
      firstName: { type: String, required: true },
      flatNo: { type: String },
      lastName: { type: String },
      phoneNo: { type: String, required: true },
      pincode: { type: Number, required: true },
      state: { type: String, required: true },
    },
    returnDetails: {
      isReturnable: { type: Boolean, default: false },
      returnStatus: {
        type: String,
        enum: ["requested", "approved", "rejected", "completed"],
        default: null,
      },
      returnReason: { type: String },
      returnRequestedAt: { type: Date },
      returnCompletedAt: { type: Date },
      refundAmount: { type: Number },
      refundMethod: {
        type: String,
        enum: ["wallet", "online_pay", "original_payment_method"],
      },
    },
  },
  { timestamps: true }
);

const Orders = mongoose.model("Orders", OrderSchema);

module.exports = Orders;
