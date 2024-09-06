const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxPurchaseAmount: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    isListed: { type: Boolean, required: true, default: true },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Coupons = mongoose.model("Coupons", couponSchema);

module.exports = Coupons;
