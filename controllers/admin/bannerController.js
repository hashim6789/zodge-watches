const BannerModel = require("../../models/Banner");

//get all banners with pagination
const getBanners = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    let banners = [];
    banners = await BannerModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (!banners) {
      return res.render("admin/bannerManagementPage", {
        banners: null,
        current: page,
        pages: null,
      });
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
    const bannerImage = req.file.filename;
    bannerTitle.toUpperCase();

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

    if (req.file) {
      updatedBanner.imageUrl = req.file.filename;
    }

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

module.exports = {
  getBanners,
  createBanner,
  editBanner,
  toggleBanner,
};
