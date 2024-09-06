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

    // Ensure that category/product is a valid ObjectId
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
    // Log the error for debugging
    console.error("Error creating offer:", err.message);

    // Send error response
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
    // Check if the new category name already exists
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
const toggleOffer = // Example Express route for toggling offer status
  async (req, res) => {
    try {
      const { offerId } = req.params;
      const { isActive } = req.body;

      // Update the offer status in the database
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

// const OfferModel = require("../models/Category");
// const ProductModel = require("../models/Product");

// //get all offers with pagination
// const getCategory = async (req, res) => {
//   try {
//     const query = req.query.query || "";
//     const page = req.query.page || 1;
//     const perPage = 6;

//     let offers = [];
//     offers = await OfferModel.find({ name: new RegExp(query, "i") })
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * perPage)
//       .limit(perPage);
//     if (!offers) {
//       return res.render("admin/categoryManagementPage", {
//         offers: null,
//         current: page,
//         pages: null,
//       });
//       //return res.status(200).json({
//       //   status: "Success",
//       //   message: "The page rendered successfully",
//       // });
//     }
//     const count = await OfferModel.countDocuments({
//       name: new RegExp(query, "i"),
//     });
//     res.render("admin/categoryManagementPage", {
//       offers,
//       current: page,
//       perPage,
//       pages: Math.ceil(count / perPage),
//     });
//   } catch (err) {
//     res.status(404).json({ status: "Success", message: "Server error!!!" });
//   }
// };

// //for create a new category
// const createCategory = async (req, res) => {
//   try {
//     let { categoryName } = req.body;
//     categoryName = categoryName.toUpperCase();
//     let category = await OfferModel.findOne({ name: categoryName });
//     console.log(category);
//     if (!category) {
//       category = new OfferModel({
//         name: categoryName,
//         isListed: true,
//         createdAt: Date.now(),
//         updatedAt: Date.now(),
//       });
//       await category.save();
//       return res.status(200).json({
//         status: "success",
//         message: "category created successfully",
//         data: {
//           category,
//         },
//       });
//     } else {
//       return res.status(404).json({
//         status: "Failed",
//         message: "The category is already exists",
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Error creating the category",
//     });
//   }
// };

// //for edit the existing category
// const editCategory = async (req, res) => {
//   try {
//     const categoryId = req.params.categoryId;
//     const { categoryName } = req.body;

//     console.log(categoryName);
//     // Check if the new category name already exists
//     const existingCategory = await OfferModel.findOne({
//       name: categoryName,
//     });

//     if (existingCategory && existingCategory._id.toString() !== categoryId) {
//       return res.status(400).json({
//         status: "error",
//         message: "Category name already exists",
//       });
//     }

//     const category = await OfferModel.findByIdAndUpdate(
//       categoryId,
//       { name: categoryName, updatedAt: Date.now() },
//       { new: true }
//     );

//     if (!category) {
//       return res.status(404).json({
//         status: "error",
//         message: "category not found",
//       });
//     }

//     return res.status(200).json({
//       status: "success",
//       message: "category status updated successfully",
//       data: category,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Error updating category status",
//     });
//   }
// };

// //for unlist the existing category
// const unlistCategory = async (req, res) => {
//   try {
//     const categoryId = req.params.categoryId;
//     const { isListed } = req.body;

//     const category = await OfferModel.findByIdAndUpdate(
//       categoryId,
//       { isListed, updatedAt: Date.now() },
//       { new: true }
//     );

//     if (!category) {
//       return res.status(404).json({
//         status: "error",
//         message: "category not found",
//       });
//     } else {
//       const products = await ProductModel.updateMany(
//         { categoryId },
//         { $set: { isListed } }
//       );
//     }

//     return res.status(200).json({
//       status: "success",
//       message: "category status updated successfully",
//       data: category,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Error updating category status",
//     });
//   }
// };

// //search offers
// const searchCategories = (req, res) => {
//   const query = req.query.query;
//   console.log(query);
//   res.redirect(`/admin/offers?query=${query}`);
// };

// module.exports = {
//   getCategory,
//   createCategory,
//   editCategory,
//   unlistCategory,
//   searchCategories,
// };
