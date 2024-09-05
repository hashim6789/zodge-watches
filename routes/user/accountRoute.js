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
  getAccountPage,
  getPersonalInfo,
  updatePersonalInfo,
  updatePersonal,
  getAddresses,
  getAddressDetails,
  editAddressDetails,
  deleteAddressDetails,
  postAddress,
  editAddress,
  deleteAddress,
  getOrderDetail,
  cancelOrder,
  sendReturnRequest,
} = require("../../controllers/user/accountController");

const router = express();

// //for testing purpose
const test = (req, res, next) => {
  console.log("yes, tested this route");
  next();
};

//get - /account
// router.get("/", checkBlocked, isAuthenticatedUser, authorizeUser, getAccount);
router.get("/:userId", test, getAccountPage);

router.get("/api/personal-info", getPersonalInfo);
router.post("/api/personal-info/", updatePersonalInfo);

//patch - /account/personal/:id
router.patch(
  "/personal/:id",
  isAuthenticatedUser,
  authorizeUser,
  updatePersonal
);

router.get("/api/addresses", test, getAddresses);
router.get("/api/address/:addressId", getAddressDetails);
router.put("/api/address/:addressId", test, editAddressDetails);
router.delete("/api/address/:addressId", test, deleteAddressDetails);

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
