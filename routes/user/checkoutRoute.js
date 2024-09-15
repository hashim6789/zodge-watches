const express = require("express");
const {
  checkCartExists,
  checkOrderExists,
} = require("../../middlewares/orderMiddleware");
const {
  isAuthenticatedUser,
  checkBlocked,
} = require("../../middlewares/authenticationMiddlewares");
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");
const router = express.Router();
const {
  getCheckout,
  getAddress,
  postCheckout,
  retryPayment,
  getOrderConfirmation,
} = require("../../controllers/user/checkoutController");

const { verifyPayment } = require("../../config/razorpayService");

router.get(
  "/",
  isAuthenticatedUser,
  authorizeUser,
  checkCartExists,
  getCheckout
);

router.post(
  "/",
  isAuthenticatedUser,
  authorizeUser,
  checkCartExists,
  postCheckout
);

router.post("/retry", retryPayment);

router.post(
  "/verify-payment",
  isAuthenticatedUser,
  authorizeUser,
  verifyPayment
);

router.get(
  "/confirmation",
  isAuthenticatedUser,
  authorizeUser,
  checkOrderExists,
  getOrderConfirmation
);

router.get("/address/:index", isAuthenticatedUser, authorizeUser, getAddress);

module.exports = router;
