const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const OfferSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    discountValue: { type: Number, required: true },
    applicableType: {
      type: String,
      enum: ["product", "category"],
      required: true,
    },
    categoryIds: [{ type: Types.ObjectId, ref: "Categories", default: null }], // Reference the Category model
    productIds: [{ type: Types.ObjectId, ref: "Products", default: null }],
    image: { type: String, required: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offers", OfferSchema);
module.exports = Offer;
