const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} = require("../../controllers/user/wishlistController");

//for Authentication
const {
  isAuthenticatedUser,
  checkBlocked,
  trackPreviousPage,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

// for testing purpose
// const test = (req, res, next) => {
//   console.log(req.url, "dsfsd");
//   next();
// };

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

router.get("/", fetchWishlist);

module.exports = router;
