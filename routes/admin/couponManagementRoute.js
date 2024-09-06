const express = require("express");

const {
  getCoupons,
  createCoupon,
  updateCoupon,
  unlistCoupon,
} = require("../../controllers/couponController");

const router = express.Router();

router.get("/", getCoupons);

router.post("/", createCoupon);

router.put("/:couponId", updateCoupon);

router.put("/:couponId/unlist", unlistCoupon);

module.exports = router;
