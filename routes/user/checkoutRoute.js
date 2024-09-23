const express = require("express");
const {
  checkCartExists,
  checkOrderExists,
} = require("../../middlewares/orderMiddleware");
const {
  isAuthenticatedUser,
  checkBlocked,
  isVerifiedUser,
} = require("../../middlewares/authenticationMiddlewares");
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");
const router = express.Router();
const {
  getCheckout,
  getAddress,
  applyCoupon,
  removeCoupon,
  postCheckout,
  retryPayment,
  getOrderConfirmation,
} = require("../../controllers/user/checkoutController");

const { verifyPayment } = require("../../config/razorpayService");

router.get(
  "/",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  isVerifiedUser,
  checkCartExists,
  getCheckout
);

router.post(
  "/",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  isVerifiedUser,
  checkCartExists,
  postCheckout
);

router.post(
  "/retry",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  isVerifiedUser,
  retryPayment
);

router.post(
  "/verify-payment",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  isVerifiedUser,
  verifyPayment
);

router.get(
  "/confirmation",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  isVerifiedUser,
  checkOrderExists,
  getOrderConfirmation
);

router.get(
  "/address/:index",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  isVerifiedUser,
  getAddress
);

router.post(
  "/coupon/apply",
  isAuthenticatedUser,
  authorizeUser,
  isVerifiedUser,
  applyCoupon
);

router.delete(
  "/coupon/remove",
  isAuthenticatedUser,
  authorizeUser,
  isVerifiedUser,
  removeCoupon
);

module.exports = router;
