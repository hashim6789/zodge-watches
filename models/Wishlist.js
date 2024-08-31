const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const WishlistsSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: "Users" },
  updatedAt: { type: Date, required: true },
  productIds: [{ type: Types.ObjectId, required: true, ref: "Products" }],
  createdAt: { type: Date, required: true },
});

const Wishlists = mongoose.model("Wishlists", WishlistsSchema);

module.exports = Wishlists;
