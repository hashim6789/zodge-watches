const express = require("express");

// //for Authentication
const {
  isAuthenticatedAdmin,
} = require("../../middlewares/authenticationMiddlewares");

// //for Authorization
const {
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../../middlewares/authorizationMiddlewares");

const {
  getCoupons,
  createCoupon,
  updateCoupon,
  unlistCoupon,
} = require("../../controllers/admin/couponController");

const router = express.Router();

router.get(
  "/",
  // isAuthenticatedAdmin,
  // authorizeAdmin,
  // authorizeAdminForModule("couponManagement"),
  getCoupons
);

router.post(
  "/",
  // isAuthenticatedAdmin,
  // authorizeAdmin,
  // authorizeAdminForModule("couponManagement"),
  createCoupon
);

router.put(
  "/:couponId",
  // isAuthenticatedAdmin,
  // authorizeAdmin,
  // authorizeAdminForModule("couponManagement"),
  updateCoupon
);

router.put(
  "/:couponId/unlist",
  // isAuthenticatedAdmin,
  // authorizeAdmin,
  // authorizeAdminForModule("couponManagement"),
  unlistCoupon
);

module.exports = router;
