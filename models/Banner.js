const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true, // To control whether the banner is active or not
    },
  },
  { timestamps: true }
);

const Banners = mongoose.model("Banners", bannerSchema);

module.exports = Banners;

//   linkUrl: {
//     type: String,
//     required: true,
//   },
//   displayOrder: {
//     type: Number,
//     default: 1, // To control the display order
//   },
