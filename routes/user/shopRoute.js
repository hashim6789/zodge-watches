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
  getCart,
  postCart,
  addToCart,
  updateQuantity,
  deleteCartProduct,
  getCheckout,
  postCheckout,
  getDeliveryAddress,
  postDeliveryAddress,
  getPayment,
  postPayment,
  getSummary,
  postPlaceOrder,
} = require("../../controllers/user/shopController");

// for testing purpose
const test = (req, res, next) => {
  console.log(req.url, "dsfsd");
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

router.get(`/search`, searchProducts);

//get - /user/shop/cart
router.get("/cart/:id", getCart);

router.post("/cart", test, postCart);

router.post("/cart/add-to-cart", addToCart);

router.patch("/cart/update-quantity", updateQuantity);

router.delete("/cart/delete-product/:id", deleteCartProduct);

router.post("/checkout", postCheckout);

router.get("/checkout", getCheckout);

router.post("/delivery-address", postDeliveryAddress);

router.get("/delivery-address", getDeliveryAddress);

router.get("/payment", getPayment);

router.post("/payment", postPayment);

router.get("/summary", getSummary);

router.post("/place-order", postPlaceOrder);

module.exports = router;
