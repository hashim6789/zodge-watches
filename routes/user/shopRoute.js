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
  getSuccessPage,
} = require("../../controllers/user/shopController");

// for testing purpose
const test = (req, res, next) => {
  console.log(req.url, "dsfsd");
  next();
};

// Middleware to initialize session steps if they don't exist
function initializeSteps(req, res, next) {
  if (!req.session.steps) {
    req.session.steps = [];
  }
  next();
}

//for the step is corrected
// Middleware to check if a specific step is completed
function checkStepCompletion(requiredStep) {
  return (req, res, next) => {
    if (
      req.session.steps === null ||
      !req.session?.steps.includes(requiredStep)
    ) {
      res.redirect("/user/shop/cart"); // Adjust the redirect URL based on your application flow
    } else {
      next();
      // Redirect to the appropriate step if the required step is not completed
    }
  };
}

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
router.get("/cart", getCart);

router.post("/cart", postCart);

router.post("/cart/add-to-cart", addToCart);

router.patch("/cart/update-quantity", updateQuantity);

router.delete("/cart/delete-product/:id", deleteCartProduct);

router.get(
  "/checkout",
  initializeSteps,
  checkStepCompletion("cart"),
  getCheckout
);

router.post(
  "/checkout",
  initializeSteps,
  checkStepCompletion("cart"),
  postCheckout
);

router.get(
  "/delivery-address",
  initializeSteps,
  checkStepCompletion("checkout"),
  getDeliveryAddress
);

router.post(
  "/delivery-address",
  initializeSteps,
  checkStepCompletion("checkout"),
  postDeliveryAddress
);

router.get(
  "/payment",
  initializeSteps,
  checkStepCompletion("address"),
  getPayment
);

router.post(
  "/payment",
  initializeSteps,
  checkStepCompletion("address"),
  postPayment
);

router.get(
  "/summary",
  initializeSteps,
  checkStepCompletion("payment"),
  getSummary
);

router.post(
  "/place-order",
  initializeSteps,
  checkStepCompletion("payment"),
  postPlaceOrder
);

router.get(
  "/place-order",
  initializeSteps,
  checkStepCompletion("payment"),
  getSuccessPage
);

module.exports = router;
