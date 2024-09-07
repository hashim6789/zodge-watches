const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateQuantity,
  deleteCartProduct,
  postCart,
} = require("../../controllers/user/cartController");

const {
  applyCoupon,
  removeCoupon,
} = require("../../controllers/couponController");

//for Authentication
const {
  isAuthenticatedUser,
  checkBlocked,
  trackPreviousPage,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

// for testing purpose
const test = (req, res, next) => {
  console.log(req.url, "dsfsd");
  next();
};

//get - /user/shop/cart
router.get("/", isAuthenticatedUser, authorizeUser, checkBlocked, getCart);

router.post("/", isAuthenticatedUser, authorizeUser, checkBlocked, postCart);

router.post("/add", isAuthenticatedUser, authorizeUser, addToCart);

router.post("/coupon/apply", applyCoupon);

router.patch(
  "/update-quantity",
  checkBlocked,
  isAuthenticatedUser,
  updateQuantity
);

router.delete(
  "/product/:productId",
  checkBlocked,
  isAuthenticatedUser,
  authorizeUser,
  deleteCartProduct
);

module.exports = router;
