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
    coupon: {
      code: { type: String, default: null },
      discountPercentage: { type: Number, default: null },
      discountAmount: { type: Number, default: null },
      maxDiscountAmount: {
        type: Number,
        default: null,
      },
    },
  },
  { timestamps: true }
);

const Carts = mongoose.model("Carts", CartsSchema);

module.exports = Carts;
