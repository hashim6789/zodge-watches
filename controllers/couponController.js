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

    // Convert coupon code to uppercase to ensure consistency
    const couponCode = code.toUpperCase();

    // Check if the coupon already exists by the coupon code
    const existingCoupon = await CouponModel.findOne({ code: couponCode });

    if (existingCoupon) {
      // If coupon already exists, return a failure response
      return res.status(409).json({
        success: false,
        message: "The coupon already exists",
      });
    }

    // If the coupon doesn't exist, create a new one
    const newCoupon = new CouponModel({
      code: couponCode,
      expiryDate: new Date(expiryDate), // Ensure expiryDate is stored as a Date object
      description,
      discountPercentage,
      minPurchaseAmount,
      maxDiscountAmount,
      usageLimit,
    });

    // Save the new coupon to the database
    await newCoupon.save();

    // Return a success response
    return res.status(200).json({
      success: true,
      message: "Coupon created successfully",
      coupon: newCoupon, // Include the created coupon details in the response
    });
  } catch (error) {
    console.error("Error creating coupon:", error);

    // Handle any server errors
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

    // Fetch the coupon based on the code and its active status
    const coupon = await CouponModel.findOne({
      code: couponCode,
      isListed: true,
    });
    console.log(coupon);

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found or inactive." });
    }

    // Check if the coupon has expired
    if (coupon.expiryDate < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired." });
    }

    // Retrieve the cart for the user
    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    // Validate minimum purchase amount required for the coupon
    if (cart.totalPrice < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount for this coupon is ₹${coupon.minPurchaseAmount}.`,
      });
    }

    // Calculate discount amount based on coupon's discount percentage
    let discountAmount = (cart.totalPrice * coupon.discountPercentage) / 100;

    // Check if the discount exceeds the maximum allowed by the coupon
    if (
      coupon.maxDiscountAmount > 0 &&
      discountAmount > coupon.maxDiscountAmount
    ) {
      discountAmount = coupon.maxDiscountAmount;
    }

    // // Apply the discount and update the cart's total amount
    // cart.coupon = {
    //   code: coupon.code,
    //   discountValue: discountAmount,
    // };
    // cart.totalPrice -= discountAmount; // Update cart total

    // // Save the updated cart and increment coupon usage count
    // await cart.save();

    // coupon.usedCount += 1;
    // await coupon.save();

    // Return success response with the updated cart details
    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully!",
      discountAmount,
      // totalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeCoupon = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming logged-in user

    // Fetch the user's cart
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Check if a coupon is applied
    if (!cart.coupon || !cart.coupon.code) {
      return res
        .status(400)
        .json({ message: "No coupon applied to the cart." });
    }

    // Recalculate the total amount by removing the coupon discount
    const discountAmount = cart.coupon.discountValue;
    cart.totalAmount += discountAmount; // Add back the discount

    // Remove the coupon
    cart.coupon = {
      code: null,
      discountValue: 0,
    };

    await cart.save();

    return res.status(200).json({
      message: "Coupon removed successfully!",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
