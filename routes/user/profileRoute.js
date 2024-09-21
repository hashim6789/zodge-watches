const express = require("express");

//for Authentication
const {
  isAuthenticatedUser,
  checkBlocked,
  trackPreviousPage,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

const {
  getAccountPage,
  updatePersonalInfo,
  createAddress,
  updateAddress,
  deleteAddress,
  cancelOrder,
  viewOrderDetail,
  sendReturnRequest,
  getOrdersList,
} = require("../../controllers/user/profileController");

const router = express.Router();
//<-------------------------personal information routes ------------------------------>

//for get the account page
router.get(
  "/:userId",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  getAccountPage
);

//for update the user information
router.patch(
  "/personal/:userId",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  updatePersonalInfo
);

//<-------------------------address management routes ------------------------------>
//for creating new address
router.post(
  "/address",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  createAddress
);

//for update the existing address
router.put(
  "/address/:addressId",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  updateAddress
);

//for deleting the existing address
router.delete(
  "/address/:addressId",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  deleteAddress
);

//<-------------------------address management routes ------------------------------>

//for cancel the order
router.patch(
  "/orders/:orderId/cancel",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  cancelOrder
);

//view the order details page
router.get(
  "/orders/:orderId/view",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  viewOrderDetail
);

//return the delivered order
router.patch(
  "/orders/:orderId/return",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  sendReturnRequest
);

// Example route for fetching orders with pagination
router.get(
  "/api/orders",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  getOrdersList
);

module.exports = router;
