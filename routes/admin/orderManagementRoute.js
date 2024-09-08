const express = require("express");
const router = express.Router();

// //for Authentication
const {
  isAuthenticatedAdmin,
} = require("../../middlewares/authenticationMiddlewares");

// //for Authorization
const {
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../../middlewares/authorizationMiddlewares");

// //function for category module
const {
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  handleReturnRequest,
  searchOrders,
} = require("../../controllers/orderController");

// //for testing purpose
const test = (req, res, next) => {
  console.log(req.url);
  next();
};

// //get - /admin/orders/
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("orderManagement"),
  getOrders
);

// //get - /admin/orders/:id
router.get(
  "/:orderId",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("orderManagement"),
  getOrderDetails
);

// //patch - `/admin/orders/:orderId`
router.patch(
  "/change-status/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("orderManagement"),
  updateOrderStatus
);

router.patch(
  "/handle-return/:orderId",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("orderManagement"),
  handleReturnRequest
);

router.get("/search", searchOrders);

module.exports = router;
