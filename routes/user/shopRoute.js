const express = require("express");
const router = express.Router();

//for Authentication
const {
  isAuthenticatedUser,
  checkBlocked,
  isVerifiedUser,
  trackPreviousPage,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

const {
  getProductDetails,
  getImage,
  filterCategoryProduct,
  filterAllProducts,
  searchProducts,
  getShop,
} = require("../../controllers/user/shopController");

// // for testing purpose
// const test = (req, res, next) => {
//   console.log(req.url, "dsfsd");
//   next();
// };

router.get("/", getShop);

//get the product details
//get - /shop/product/:id
router.get("/products/:productId", getProductDetails);

//get the product image url
//get - /shop/getImagePath
router.get("/getImagePath", getImage);

module.exports = router;
