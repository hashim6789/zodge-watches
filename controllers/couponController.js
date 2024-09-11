const CouponModel = require("../models/Coupon");
const CartModel = require("../models/Cart");

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
      discountPercentage,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
    } = req.body;

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

const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user?._id;

    console.log(couponCode, userId);

    const coupon = await CouponModel.findOne({
      code: couponCode,
      isListed: true,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found or inactive." });
    }

    if (coupon.expiryDate < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired." });
    }

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }
    console.log(cart.totalPrice, coupon.minPurchaseAmount);

    if (cart.totalPrice < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount for this coupon is ₹${coupon.minPurchaseAmount}.`,
      });
    }

    let discountAmount = (cart.totalPrice * coupon.discountPercentage) / 100;

    if (
      coupon.maxDiscountAmount > 0 &&
      discountAmount > coupon.maxDiscountAmount
    ) {
      discountAmount = coupon.maxDiscountAmount;
    }

    cart.coupon = {
      code: coupon.code,
      discountAmount: discountAmount,
      discountPercentage: coupon.discountPercentage,
      maxDiscountAmount: coupon.maxDiscountAmount,
    };

    cart.totalPrice -= discountAmount;

    await cart.save();

    coupon.usedCount += 1;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully!",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const removeCoupon = async (req, res) => {
  try {
    const userId = req.user?._id;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    if (!cart.coupon || !cart.coupon.code) {
      return res
        .status(400)
        .json({ success: false, message: "No coupon applied to the cart." });
    }

    const discountAmount = cart.coupon.discountAmount;
    cart.totalPrice += discountAmount;

    cart.coupon = {
      discountAmount: null,
      code: null,
      discountPercentage: null,
      maxDiscountAmount: null,
    };

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Coupon removed successfully!",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  unlistCoupon,
  applyCoupon,
  removeCoupon,
};
