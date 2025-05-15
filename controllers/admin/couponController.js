const CouponModel = require("../../models/Coupon");
const CartModel = require("../../models/Cart");

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
      discountPercentage,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
    } = req.body;

    console.log(req.body);

    const couponCode = code.toUpperCase();

    const existingCoupon = await CouponModel.findOne({ code: couponCode });

    if (existingCoupon) {
      return res.status(404).json({
        success: false,
        message: "The coupon already exists",
      });
    }

    const newCoupon = new CouponModel({
      code: couponCode,
      expiryDate: new Date(expiryDate),
      description,
      discountPercentage,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
    });

    await newCoupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);

    return res.status(500).json({
      status: "error",
      message: "Server error occurred while creating the coupon",
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
      usageLimit,
    } = req.body;

    const updatedCoupon = await CouponModel.findByIdAndUpdate(
      couponId,
      {
        code,
        expiryDate,
        description,
        discountValue,
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

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  unlistCoupon,
};
