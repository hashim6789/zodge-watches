const express = require("express");
const router = express.Router();
const {
  getCheckout,
  getAddress,
  postCheckout,
  getOrderConfirmation,
} = require("../../controllers/user/checkoutController");

router.get("/", getCheckout);

router.post("/", postCheckout);

router.get("/confirmation", getOrderConfirmation);

router.get("/address/:index", getAddress);

module.exports = router;
