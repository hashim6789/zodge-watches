const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const OfferSchema = new Schema(
  {
    title: { type: String, required: true },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    }, // Only category reference
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offers", OfferSchema);
module.exports = Offer;
