const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  removeFromWishlist,
  addToCartFromWishlist,
  fetchWishlist,
} = require("../../controllers/user/wishlistController");

//for Authentication
const {
  isAuthenticatedUser,
  checkBlocked,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

router.post(
  "/add",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  addToWishlist
);
router.delete(
  "/:productId/remove",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  removeFromWishlist
);
router.put("/:productId/cart", addToCartFromWishlist);

router.get("/", fetchWishlist);

module.exports = router;
