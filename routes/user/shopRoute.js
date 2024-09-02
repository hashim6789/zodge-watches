// const express = require("express");
// const router = express.Router();

// //for Authentication
// const {
//   isAuthenticatedUser,
//   checkBlocked,
//   trackPreviousPage,
// } = require("../../middlewares/authenticationMiddlewares");

// //for Authorization
// const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

// const {
//   quickView,
//   getImage,
//   filterCategoryProduct,
//   filterAllProducts,
//   searchProducts,
//   addToWishlist,
//   removeFromWishlist,
//   getCart,
//   postCart,
//   addToCart,
//   updateQuantity,
//   deleteCartProduct,
//   getCheckout,
//   postCheckout,
//   getDeliveryAddress,
//   postDeliveryAddress,
//   getPayment,
//   postPayment,
//   getSummary,
//   postPlaceOrder,
//   getSuccessPage,
// } = require("../../controllers/user/shopController");

// // for testing purpose
// const test = (req, res, next) => {
//   console.log(req.url, "dsfsd");
//   next();
// };

// // Middleware to initialize session steps if they don't exist
// function initializeSteps(req, res, next) {
//   if (!req.session.steps) {
//     req.session.steps = [];
//   }
//   next();
// }

// //for the step is corrected
// // Middleware to check if a specific step is completed
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

// //get the product details
// //get - /user/shop/quickview/:id
// router.get("/quickview/:id", checkBlocked, quickView);

// //get the product image url
// //get - /user/shop/getImagePath
// router.get("/getImagePath", getImage);

// //search the whole products
// router.get("/filter/products", filterAllProducts);

// //search the products by the category
// router.get("/filter/categories/:categoryId", filterCategoryProduct);

// router.get("/search", searchProducts);

// //add a product into a wishlist of the corresponding user
// router.post("/wishlist", isAuthenticatedUser, authorizeUser, addToWishlist);

// //remove a product from a wishlist of the corresponding user
// router.delete(
//   "/wishlist/:productId",
//   isAuthenticatedUser,
//   authorizeUser,
//   removeFromWishlist
// );

// //get - /user/shop/cart
// router.get(
//   "/cart",
//   checkBlocked,
//   trackPreviousPage,
//   isAuthenticatedUser,
//   authorizeUser,
//   checkBlocked,
//   getCart
// );

// router.post(
//   "/cart",
//   checkBlocked,
//   isAuthenticatedUser,
//   authorizeUser,
//   postCart
// );

// router.post(
//   "/cart/add-to-cart",
//   checkBlocked,
//   isAuthenticatedUser,
//   authorizeUser,
//   addToCart
// );

// router.patch(
//   "/cart/update-quantity",
//   checkBlocked,
//   isAuthenticatedUser,
//   updateQuantity
// );

// router.delete(
//   "/cart/delete-product/:id",
//   checkBlocked,
//   isAuthenticatedUser,
//   authorizeUser,
//   deleteCartProduct
// );

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

// // router.get(
// //   "/delivery-address",
// //   checkBlocked,
// //   initializeSteps,
// //   checkStepCompletion("checkout"),
// //   getDeliveryAddress
// // );

// // router.post(
// //   "/delivery-address",
// //   checkBlocked,
// //   initializeSteps,
// //   checkStepCompletion("checkout"),
// //   postDeliveryAddress
// // );

// // router.get(
// //   "/payment",
// //   checkBlocked,
// //   initializeSteps,
// //   checkStepCompletion("address"),
// //   getPayment
// // );

// // router.post(
// //   "/payment",
// //   checkBlocked,
// //   initializeSteps,
// //   checkStepCompletion("address"),
// //   postPayment
// // );

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

// module.exports = router;
