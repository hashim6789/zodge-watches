const express = require("express");

//for Authentication
const {
  isAuthenticatedUser,
  redirectIfAuthenticated,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

const {
  getProfile,
  updatePersonal,
  postAddress,
  editAddress,
  getOrderDetail,
  cancelOrder,
} = require("../../controllers/user/profileController");

const router = express();

//for testing purpose
const test = (req, res, next) => {
  console.log(req.url);
  next();
};

//get - /user/profile
router.get("/:id", isAuthenticatedUser, authorizeUser, getProfile);

//patch - /user/profile/personal/:id
router.patch(
  "/personal/:id",
  isAuthenticatedUser,
  authorizeUser,
  updatePersonal
);

//post - /user/profile/address
router.post("/address", isAuthenticatedUser, authorizeUser, postAddress);

//put - /user/profile/address
router.put("/address/:id", isAuthenticatedUser, authorizeUser, editAddress);

//get - /user/profile/orders/:id
router.get("/orders/:orderId", test, getOrderDetail);

router.patch("/orders/cancel/:orderId", cancelOrder);

module.exports = router;
