const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const OfferSchema = new Schema(
  {
    title: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    offerType: {
      type: String,
      enum: ["category", "product"],
      required: true,
    },
    category: {
      type: Types.ObjectId,
      ref: "Categories",
      required: function () {
        return this.offerType === "category";
      },
    },
    product: {
      type: Types.ObjectId,
      ref: "Products",
      required: function () {
        return this.offerType === "product";
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offers", OfferSchema);
module.exports = Offer;
