const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: Types.ObjectId, required: true, ref: "Categories" },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    reservedStock: { type: Number, required: true, default: 0 },
    images: [{ type: String, required: true }],
    isListed: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Products", productSchema);
module.exports = Product;
