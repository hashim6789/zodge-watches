const OfferModel = require("../../models/Offer");
const CategoryModel = require("../../models/Category");
const ProductModel = require("../../models/Product");
const mongoose = require("mongoose");

const getOffers = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    const categories = await CategoryModel.find({ isListed: true });
    // const products = await ProductModel.find({ isListed: true });

    let offers = [];
    offers = await OfferModel.find({ name: new RegExp(query, "i") })
      .populate("categoryIds", "name") // Populates 'name' from the Category model
      .populate("productIds", "name") // Populates 'name' from the Product model
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (!offers) {
      return res.render("admin/offerManagementPage", {
        categories,
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
      name: new RegExp(query, "i"),
    });
    // console.log(categories);
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

const createOffer = async (req, res) => {
  try {
    const offerData = req.body;
    console.log(offerData);

    // Check if the offer already exists
    const existingOffer = await OfferModel.findOne({ name: offerData.name });
    if (existingOffer) {
      return res
        .status(400)
        .json({ success: false, message: "The offer already exists" });
    }

    // Validate applicable type
    if (!["product", "category"].includes(offerData.applicableType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid applicable type" });
    }

    // Create and save the new offer
    const newOffer = new OfferModel(offerData);
    await newOffer.save();

    // Find and update products based on applicable type
    if (offerData.applicableType === "product") {
      // Update products by their IDs
      await ProductModel.updateMany(
        { _id: { $in: offerData.productIds } },
        { $addToSet: { offers: newOffer._id } }
      );
    } else if (offerData.applicableType === "category") {
      // Update products by category IDs
      await ProductModel.updateMany(
        { categoryId: { $in: offerData.categoryIds } },
        { $addToSet: { offers: newOffer._id } }
      );
    }

    return res.status(201).json({
      success: true,
      message: "The offer is created successfully and added to the products",
      newOffer,
    });
  } catch (err) {
    console.error("Error creating offer:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error!!!", error: err.message });
  }
};

const editOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offerData = req.body;

    // Find the existing offer
    const existingOffer = await OfferModel.findById(offerId);
    if (!existingOffer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    // Update the offer
    const updatedOffer = await OfferModel.findByIdAndUpdate(
      offerId,
      offerData,
      { new: true }
    );

    // Remove the offer ID from products that are no longer part of the offer
    if (existingOffer.applicableType === "product") {
      await ProductModel.updateMany(
        { _id: { $in: existingOffer.productIds } },
        { $pull: { offers: offerId } }
      );
    } else if (existingOffer.applicableType === "category") {
      await ProductModel.updateMany(
        { categoryId: { $in: existingOffer.categoryIds } },
        { $pull: { offers: offerId } }
      );
    }

    // Add the offer ID to the newly updated products or categories
    if (offerData.applicableType === "product") {
      await ProductModel.updateMany(
        { _id: { $in: offerData.productIds } },
        { $addToSet: { offers: updatedOffer._id } } // Use $addToSet to avoid duplicates
      );
    } else if (offerData.applicableType === "category") {
      await ProductModel.updateMany(
        { categoryId: { $in: offerData.categoryIds } },
        { $addToSet: { offers: updatedOffer._id } } // Use $addToSet to avoid duplicates
      );
    }

    return res.status(200).json({
      success: true,
      message: "The offer is updated successfully and associated with products",
      updatedOffer,
    });
  } catch (err) {
    console.error("Error updating offer:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error!!!",
      error: err.message,
    });
  }
};

const fetchOffer = async (req, res) => {
  const offerId = req.params.id;
  try {
    const offer = await OfferModel.findById(offerId)
      .populate("categoryIds", "name")
      .populate("productIds", "name")
      .exec();

    const categories = await CategoryModel.find({ isListed: true }, "name");
    const products = await ProductModel.find({ isListed: true }, "name");

    console.log(products, categories);

    res.json({
      success: true,
      offer,
      categories,
      products,
    });
  } catch (error) {
    console.error("Error fetching offer details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getApplicableItems = async (req, res) => {
  const { type } = req.query;

  try {
    let items;
    if (type === "product") {
      items = await ProductModel.find({ isListed: true });
    } else if (type === "category") {
      items = await CategoryModel.find({ isListed: true });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid applicable type" });
    }

    return res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("Error fetching applicable items:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error!!!", error: err.message });
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

module.exports = {
  createOffer,
  editOffer,
  getApplicableItems,
  fetchOffer,
  getOffers,
  getOffer,
  updateOffer,
  toggleOffer,
};
