const OfferModel = require("../models/Offer");
const CategoryModel = require("../models/Category");
const mongoose = require("mongoose");

const getOffers = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    const categories = await CategoryModel.find({ isListed: true });

    let offers = [];
    offers = await OfferModel.find({ title: new RegExp(query, "i") })
      .populate("categoryId", "name")
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
    console.log(categories);
    res.render("admin/offerManagementPage", {
      offers,
      categories,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(404).json({ success: false, message: "Server error!!!" });
  }
};

//
const createOffer = async (req, res) => {
  try {
    const offerData = req.body;
    console.log(offerData);

    // Check if the offer already exists
    const existingOffer = await OfferModel.findOne({ title: offerData.title });
    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: "The offer already exists",
      });
    }

    // Ensure that offer type is category
    if (
      offerData.discountType !== "percentage" &&
      offerData.discountType !== "flat"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type. Only percentage or flat is allowed.",
      });
    }

    // Check if category ID is provided
    if (!offerData.categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required for category type offers",
      });
    }

    // Validate the category ID
    if (!mongoose.Types.ObjectId.isValid(offerData.categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Remove any product-related data since we only handle category-wise offers
    offerData.product = null;

    // Create and save the new offer
    const newOffer = new OfferModel(offerData);
    await newOffer.save();

    return res.status(201).json({
      success: true,
      message: "The offer is created successfully",
      newOffer,
    });
  } catch (err) {
    console.error("Error creating offer:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error!!!",
      error: err.message,
    });
  }
};

const getOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    // Validate the offerId
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid offer ID",
      });
    }

    // Find the offer by ID and populate category details if necessary
    const offer = await OfferModel.findById(offerId).populate(
      "categoryId",
      "name"
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Return the offer details
    return res.status(200).json({
      success: true,
      offer,
    });
  } catch (err) {
    console.error("Error fetching offer details:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error!!!",
      error: err.message,
    });
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

module.exports = { getOffers, createOffer, getOffer, updateOffer, toggleOffer };
