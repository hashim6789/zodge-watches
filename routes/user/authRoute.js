const express = require("express");
const router = express.Router();

//for Authentication
const {
  isAuthenticatedUser,
  checkBlocked,
  isVerifiedUser,
  redirectIfAuthenticated,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

//functions for user module
const {
  postLocalLogin,
  postLocalSignup,
  verifyOtp,
  getSignup,
  getOtpPage,
  resendOtp,
  getLogin,
  googleSignup,
  googleLogin,
  googleSignupCallback,
  googleLoginCallback,
  redirectToProfile,
  forgotPassword,
  changePassword,
  getResetPasswordPage,
  validateCurrentPassword,
  changeUserPassword,
  logout,
} = require("../../controllers/user/authController");

// const test = (req, res, next) => {
//   console.log(req.url);
//   next();
// };

// //get the signup page
// router.get("/signup", redirectIfAuthenticated, getSignup);

//post the signup page
router.post("/signup", redirectIfAuthenticated, postLocalSignup);

//get otp entering page
// router.get("/otp", getOtpPage);

//post otp resend
router.post(
  "/api/send-otp",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  resendOtp
);

//post otp generator and verify the otp
router.post(
  "/api/verify-otp",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  verifyOtp
);

//post otp resend
router.post(
  "/api/resend-otp",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  resendOtp
);

// //get the login page
// router.get("/login", redirectIfAuthenticated, getLogin);

//post the login page
router.post("/login", redirectIfAuthenticated, postLocalLogin);

// Auth with Google for signup
router.get("/google/signup", redirectIfAuthenticated, googleSignup);

// Auth with Google for login
router.get("/google/login", redirectIfAuthenticated, googleLogin);

// Callback route for Google to redirect to for signup
router.get(
  "/google/signup/callback",

  googleSignupCallback,
  redirectToProfile
);

// Callback route for Google to redirect to for login
router.get(
  "/google/login/callback",

  googleLoginCallback,
  redirectToProfile
);

//post - /auth/forgot-password
router.post("/forgot-password", forgotPassword);

// //post - /auth/reset-password
// router.get("/reset-password/:token", getResetPasswordPage);

// //post - /auth/verify-password
// router.post("/change-password", changePassword);

router.post(
  "/validate-password",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  isVerifiedUser,
  validateCurrentPassword
);

router.post(
  "/change-user-password",
  isAuthenticatedUser,
  authorizeUser,
  checkBlocked,
  isVerifiedUser,
  changeUserPassword
);

// Auth logout
router.get("/logout", isAuthenticatedUser, authorizeUser, logout);

module.exports = router;
