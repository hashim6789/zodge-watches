const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const WishlistsSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, ref: "Users" },
    productIds: [{ type: Types.ObjectId, required: true, ref: "Products" }],
  },
  { timestamps: true }
);

const Wishlists = mongoose.model("Wishlists", WishlistsSchema);

module.exports = Wishlists;
