const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const CartsSchema = new Schema({
  products: [
    {
      productId: { type: Types.ObjectId, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Double, required: true },
  updatedAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  userId: { type: Types.ObjectId, required: true },
});

const Carts = mongoose.model("Carts", CartsSchema);

module.exports = Carts;
