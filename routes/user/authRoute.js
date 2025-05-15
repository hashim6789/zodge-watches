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
  resendOtp,
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

//post the signup page
router.post("/signup", redirectIfAuthenticated, postLocalSignup);

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

//post - /auth/reset-password
router.get("/reset-password/:token", getResetPasswordPage);

//post - /auth/verify-password
router.post("/change-password", changePassword);

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
