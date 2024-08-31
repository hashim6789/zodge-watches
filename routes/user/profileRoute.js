const express = require("express");

//for Authentication
const {
  isAuthenticatedUser,
  redirectIfAuthenticated,
  checkBlocked,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

const {
  getProfile,
  updatePersonal,
  postAddress,
  editAddress,
  deleteAddress,
  getOrderDetail,
  cancelOrder,
  sendReturnRequest,
} = require("../../controllers/user/profileController");

const router = express();

// //for testing purpose
// const test = (req, res, next) => {
//   console.log(req.url);
//   next();
// };

//get - /user/profile
router.get("/", checkBlocked, isAuthenticatedUser, authorizeUser, getProfile);

//patch - /user/profile/personal/:id
router.patch(
  "/personal/:id",
  isAuthenticatedUser,
  authorizeUser,
  updatePersonal
);

//post - /user/profile/address
router.post(
  "/address",
  checkBlocked,
  isAuthenticatedUser,
  authorizeUser,
  postAddress
);

//put - /user/profile/address
router.put(
  "/address/:id",
  checkBlocked,
  isAuthenticatedUser,
  authorizeUser,
  editAddress
);

//delete - /user/profile/address/:addressId
router.delete(
  "/address/:addressId",
  isAuthenticatedUser,
  authorizeUser,
  deleteAddress
);

//get - /user/profile/orders/:id
router.get(
  "/orders/:orderId",
  isAuthenticatedUser,
  authorizeUser,
  getOrderDetail
);

//patch - /user/profile/orders/cancel/:orderId
router.patch(
  "/orders/cancel/:orderId",
  isAuthenticatedUser,
  authorizeUser,
  cancelOrder
);

//patch - /user/profile/orders/return/:orderId
router.post(
  "/orders/return",
  isAuthenticatedUser,
  authorizeUser,
  sendReturnRequest
);

module.exports = router;
