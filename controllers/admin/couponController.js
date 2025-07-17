const CouponModel = require("../../models/Coupon");
const CartModel = require("../../models/Cart");
const HttpStatusCode = require("../../constants/httpStatusCode");
const HttpStatus = require("../../constants/httpStatus");
const HttpResponseMessage = require("../../constants/httpResponseMessage");

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

    // console.log(coupons);
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
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
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
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: HttpResponseMessage.ERROR.COUPON_EXIST,
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

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: HttpResponseMessage.SUCCESS.COUPON_CREATION,
      coupon: newCoupon,
    });
  } catch (error) {
    // console.error("Error creating coupon:", error);

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.COUPON_CREATION,
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
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.COUPON_NOT_FOUND,
      });
    }

    res.status(HttpStatusCode.OK).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.SUCCESS.COUPON_UPDATE,
      updatedCoupon,
    });
  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
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
        .status(HttpStatusCode.NOT_FOUND)
        .json({
          success: false,
          message: HttpResponseMessage.ERROR.COUPON_NOT_FOUND,
        });
    }

    res
      .status(HttpStatusCode.OK)
      .json({ success: true, coupon: updatedCoupon });
  } catch (error) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: HttpResponseMessage.ERROR.SERVER_ERROR,
      });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  unlistCoupon,
};
