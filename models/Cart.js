const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const CartsSchema = new Schema(
  {
    products: [
      {
        productId: { type: Types.ObjectId, required: true, ref: "Products" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    userId: { type: Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const Carts = mongoose.model("Carts", CartsSchema);

module.exports = Carts;
