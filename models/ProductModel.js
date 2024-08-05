const mongoose = require("mongoose");
const { Schema, Types } = mongoose; // Import Types from mongoose

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  categoryId: { type: Types.ObjectId, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  images: [{ type: String, required: true }],
  isListed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
