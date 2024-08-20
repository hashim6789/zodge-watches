const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const OrdersSchema = new Schema({
  products: [
    {
      price: { type: Number, required: true },
      productId: { type: Types.ObjectId, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ["pending", " failed", " placed", "shipped", "delivered", "returned"],
  },
  createdAt: { type: Date, required: true },
  userId: { type: Types.ObjectId, required: true },
  updatedAt: { type: Date, required: true },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["wallet", " online_pay", "cod"],
  },
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
});

const Orders = mongoose.model("Orders", OrdersSchema);

module.exports = Orders;
