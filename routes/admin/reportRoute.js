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
  getSalesReport,
  getSalesChart,
  getOrdersStatusChart,
  getUserGrowth,
} = require("../../controllers/reportController");

const router = express.Router();

router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("reportManagement"),
  getSalesReport
);

router.get(
  "/api/sales-data",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("reportManagement"),
  getSalesChart
);

router.get("/api/order-status-data", getOrdersStatusChart);

router.get("/api/user-growth-data", getUserGrowth);

module.exports = router;
