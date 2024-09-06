const CouponModel = require("../models/Coupon");

//for get all coupons
const getCoupons = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;
    let coupons = [];
    coupons = await CouponModel.find({ code: new RegExp(query, "i") })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    console.log(coupons);
    if (!coupons) {
      return res.render("admin/couponManagementPage", {
        coupons: null,
        current: page,
        pages: null,
      });
      //return res.status(200).json({
      //   status: "Success",
      //   message: "The page rendered successfully",
      // });
    }
    const count = await CouponModel.countDocuments({
      name: new RegExp(query, "i"),
    });
    res.render("admin/couponManagementPage", {
      coupons,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "The server error" });
  }
};

//for creating the new coupon
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      expiryDate,
      description,
      discountValue,
      maximumPurchase,
      minimumPurchase,
      usageLimit,
    } = req.body;

    const coupon = await CouponModel.findOne({ code: couponCode });
    if (!coupon) {
      const newCoupon = new CouponModel({
        code,
        expiryDate,
        description,
        discountValue,
        minPurchaseAmount: minimumPurchase,
        maxPurchaseAmount: maximumPurchase,
        usageLimit,
      });

      newCoupon.save();
      return res.status(200).json({
        status: "success",
        message: "coupon created successfully",
        coupon,
      });
    }

    return res.status(404).json({
      status: "Failed",
      message: "The coupon is already exists",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "server error",
    });
  }
};

//for updating the existing coupon
const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const {
      code,
      expiryDate,
      description,
      discountValue,
      minimumPurchase,
      maximumPurchase,
      usageLimit,
    } = req.body;

    const updatedCoupon = await CouponModel.findByIdAndUpdate(
      couponId,
      {
        code,
        expiryDate,
        description,
        discountValue,
        maxPurchaseAmount: maximumPurchase,
        minPurchaseAmount: minimumPurchase,
        usageLimit,
      },
      { new: true }
    );

    console.log("updated = ", updatedCoupon);

    if (!updatedCoupon) {
      return res.status(404).json({
        status: "Failed",
        message: "The coupon is not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "coupon updated successfully",
      updatedCoupon,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "server error",
    });
  }
};

//for unlist and list the coupon
const unlistCoupon = async (req, res) => {
  try {
    const couponId = req.params.couponId;
    const { isListed } = req.body;

    console.log(couponId, isListed);

    const updatedCoupon = await CouponModel.findByIdAndUpdate(
      couponId,
      { isListed },
      { new: true }
    );

    console.log(updatedCoupon);

    if (!updatedCoupon) {
      return res
        .status(404)
        .json({ success: false, message: "The coupon is not found" });
    }

    res.status(200).json({ success: true, coupon: updatedCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: "server error." });
  }
};

module.exports = { getCoupons, createCoupon, updateCoupon, unlistCoupon };
