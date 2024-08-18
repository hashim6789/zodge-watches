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
    enum: ["pending", " failed", " placed", "shipped", "returned"],
  },
  createdAt: { type: Date, required: true },
  userId: { type: Types.ObjectId, required: true },
  updatedAt: { type: Date, required: true },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["wallet", " online_pay", " cash_on_delivery"],
  },
  addressId: { type: Types.ObjectId, required: true },
});

const Orders = mongoose.model("Orders", OrdersSchema);

module.exports = Orders;
