const express = require("express");
const router = express.Router();

//for Authentication
const {
  isAuthenticatedUser,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

const {
  quickView,
  getImage,
  filterCategoryProduct,
  filterAllProducts,
  searchProducts,
} = require("../../controllers/user/shopController");

const test = (req, res, next) => {
  console.log(req.url);
  next();
};

//get the product details
//get - /user/shop/quickview/:id
router.get("/quickview/:id", isAuthenticatedUser, authorizeUser, quickView);

//get the product image url
//get - /user/shop/getImagePath
router.get("/getImagePath", isAuthenticatedUser, authorizeUser, getImage);

//search the whole products
router.get("/filter/products", filterAllProducts);

//search the products by the category
router.get("/filter/category/:id", filterCategoryProduct);

router.get(`/search`, test, searchProducts);

module.exports = router;
