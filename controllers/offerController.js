const OfferModel = require("../models/Offer");
const mongoose = require("mongoose");

const getOffers = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    let offers = [];
    offers = await OfferModel.find({ title: new RegExp(query, "i") })
      .populate("product", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (!offers) {
      return res.render("admin/offerManagementPage", {
        offers: null,
        current: page,
        pages: null,
      });
      //return res.status(200).json({
      //   status: "Success",
      //   message: "The page rendered successfully",
      // });
    }
    const count = await OfferModel.countDocuments({
      title: new RegExp(query, "i"),
    });
    console.log(offers, count);
    res.render("admin/offerManagementPage", {
      offers,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(404).json({ success: false, message: "Server error!!!" });
  }
};
const createOffer = async (req, res) => {
  try {
    const offerData = req.body;

    const offer = await OfferModel.findOne({ title: offerData.title });
    if (offer) {
      return res
        .status(400)
        .json({ success: false, message: "The offer already exists" });
    }

    if (offerData.offerType === "category") {
      offerData.product = null;
    } else if (offerData.offerType === "product") {
      offerData.category = null;
    }

    // Check if category/product ID is provided based on offerType
    if (offerData.offerType === "category" && !offerData.category) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required for category type offers",
      });
    }
    if (offerData.offerType === "product" && !offerData.product) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required for product type offers",
      });
    }

    if (
      offerData.category &&
      !mongoose.Types.ObjectId.isValid(offerData.category)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }
    if (
      offerData.product &&
      !mongoose.Types.ObjectId.isValid(offerData.product)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const newOffer = new OfferModel(offerData);

    await newOffer.save();

    return res.status(201).json({
      success: true,
      message: "The offer is created successfully",
      newOffer,
    });
  } catch (err) {
    console.error("Error creating offer:", err.message);

    return res
      .status(500)
      .json({ success: false, message: "Server error!!!", error: err.message });
  }
};

const updateOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const offerData = req.body;

    console.log(offerData);
    const updatedOffer = await OfferModel.findByIdAndUpdate(
      offerId,
      offerData,
      { new: true }
    );

    if (!updatedOffer) {
      return res.status(404).json({
        success: false,
        message: "The offer is not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "category status updated successfully",
      updatedOffer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "The server error",
    });
  }
};
const toggleOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { isActive } = req.body;

    const updatedOffer = await OfferModel.findByIdAndUpdate(
      offerId,
      { isActive },
      { new: true }
    );

    if (updatedOffer) {
      return res.json({ success: true, offer: updatedOffer });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getOffers, createOffer, updateOffer, toggleOffer };
