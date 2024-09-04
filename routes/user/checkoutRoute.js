const express = require("express");
const router = express.Router();
const {
  getCheckout,
  getAddress,
  postCheckout,
  getOrderConfirmation,
} = require("../../controllers/user/checkoutController");

const { verifyPayment } = require("../../config/razorpayService");

router.get("/", getCheckout);

router.post("/", postCheckout);

router.post("/verify-payment", verifyPayment);

router.get("/confirmation", getOrderConfirmation);

router.get("/address/:index", getAddress);

module.exports = router;
