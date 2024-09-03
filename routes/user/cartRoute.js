const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateQuantity,
  deleteCartProduct,
  postCart,
} = require("../../controllers/user/cartController");

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

// // Middleware to initialize session steps if they don't exist
// function initializeSteps(req, res, next) {
//   if (!req.session.steps) {
//     req.session.steps = [];
//   }
//   next();
// }

//for the step is corrected
// Middleware to check if a specific step is completed
// function checkStepCompletion(requiredStep) {
//   return (req, res, next) => {
//     if (
//       req.session.steps === null ||
//       !req.session?.steps.includes(requiredStep)
//     ) {
//       res.redirect("/user/shop/cart"); // Adjust the redirect URL based on your application flow
//     } else {
//       next();
//       // Redirect to the appropriate step if the required step is not completed
//     }
//   };
// }

//get - /user/shop/cart
router.get(
  "/",
  checkBlocked,
  trackPreviousPage,
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  getCart
);

router.post("/", checkBlocked, isAuthenticatedUser, authorizeUser, postCart);

router.post(
  "/add",
  checkBlocked,
  isAuthenticatedUser,
  authorizeUser,
  addToCart
);

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

// router.get(
//   "/checkout",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("cart"),
//   getCheckout
// );

// router.post(
//   "/checkout",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("cart"),
//   postCheckout
// );

// router.get(
//   "/delivery-address",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("checkout"),
//   getDeliveryAddress
// );

// router.post(
//   "/delivery-address",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("checkout"),
//   postDeliveryAddress
// );

// router.get(
//   "/payment",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("address"),
//   getPayment
// );

// router.post(
//   "/payment",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("address"),
//   postPayment
// );

// router.get(
//   "/summary",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("payment"),
//   getSummary
// );

// router.post(
//   "/place-order",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("payment"),
//   postPlaceOrder
// );

// router.get(
//   "/place-order",
//   checkBlocked,
//   initializeSteps,
//   checkStepCompletion("payment"),
//   getSuccessPage
// );

module.exports = router;
