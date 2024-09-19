const BannerModel = require("../models/Banner");

//get all banners with pagination
const getBanners = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    let banners = [];
    banners = await BannerModel
      .find
      // { name: new RegExp(query, "i") }
      ()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (!banners) {
      return res.render("admin/bannerManagementPage", {
        banners: null,
        current: page,
        pages: null,
      });
      //return res.status(200).json({
      //   status: "Success",
      //   message: "The page rendered successfully",
      // });
    }
    const count = await BannerModel.countDocuments({
      name: new RegExp(query, "i"),
    });
    res.render("admin/bannerManagementPage", {
      banners,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(404).json({ status: "Success", message: "Server error!!!" });
  }
};

//for create a new banner
const createBanner = async (req, res) => {
  try {
    const { bannerTitle, bannerSubTitle } = req.body;
    const bannerImage = req.file.filename; // Get the uploaded banner image filename
    bannerTitle.toUpperCase();

    console.log(bannerTitle, bannerSubTitle, bannerImage);
    // Save the banner data (title and image) to the database
    // Assuming you have a Banner model, replace with your logic

    let banner = await BannerModel.findOne({ title: bannerTitle });
    if (banner) {
      return res
        .status(400)
        .json({ success: false, message: "The banner is already exist!" });
    }

    banner = new BannerModel({
      title: bannerTitle,
      subTitle: bannerSubTitle,
      imageUrl: bannerImage,
    });
    banner.save();

    return res.status(200).json({
      success: true,
      message: "banner created successfully",
      banner,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error creating the banner",
    });
  }
};

//for edit the existing banner
const editBanner = async (req, res) => {
  try {
    const bannerId = req.params.bannerId;
    const { bannerTitle, bannerSubTitle } = req.body;
    let updatedBanner = { title: bannerTitle, subTitle: bannerSubTitle };

    // If a new image is uploaded, add it to the update
    if (req.file) {
      updatedBanner.imageUrl = req.file.filename; // Assuming file is saved with the correct path
    }

    // Update the banner in the database
    const banner = await BannerModel.findByIdAndUpdate(bannerId, updatedBanner);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "The banner is not found !" });
    }

    res.json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating banner" });
  }
};

//for unlist the existing banner
const toggleBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const { isActive } = req.body;

    const updatedBanner = await BannerModel.findByIdAndUpdate(
      bannerId,
      { isActive },
      { new: true }
    );

    if (updatedBanner) {
      return res.json({ success: true, banner: updatedBanner });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// //search banners
// const searchCategories = (req, res) => {
//   const query = req.query.query;
//   console.log(query);
//   res.redirect(`/admin/banners?query=${query}`);
// };

// const getAllCategoriesAPI = async (req, res) => {
//   try {
//     const banners = await BannerModel.find({ isListed: true }); // Fetch all banners from the database
//     res.json(banners);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching banners", error });
//   }
// };

module.exports = {
  getBanners,
  createBanner,
  editBanner,
  toggleBanner,
  //   searchBanners,
  //   getAllCategoriesAPI,
};
