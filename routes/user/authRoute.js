const express = require("express");
const router = express.Router();

//for Authentication
const {
  isAuthenticatedUser,
  checkBlocked,
  redirectIfAuthenticated,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

//functions for user module
const {
  getSignup,
  postSignup,
  getOtpPage,
  postOtp,
  resendOtp,
  getLogin,
  postLogin,
  googleSignup,
  googleLogin,
  googleSignupCallback,
  googleLoginCallback,
  redirectToProfile,
  getHome,
  resetPassword,
  changePassword,
  getResetPasswordPage,
  logout,
} = require("../../controllers/user/authController");

const test = (req, res, next) => {
  console.log(req.url);
  next();
};

//get the signup page
router.get("/signup", redirectIfAuthenticated, getSignup);

//post the signup page
router.post("/signup", postSignup);

//get otp entering page
router.get("/verify-otp", getOtpPage);

//post otp generator
router.post("/verify-otp", postOtp);

//post otp resend
router.post("/resend-otp", resendOtp);

//get the login page
router.get("/login", redirectIfAuthenticated, getLogin);

//post the login page
router.post("/login", postLogin);

// Auth with Google for signup
router.get("/google/signup", googleSignup);

// Auth with Google for login
router.get("/google/login", googleLogin);

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

//get home page
router.get("/home", checkBlocked, getHome);

//post - /user/auth/reset-password
router.post("/reset-password", resetPassword);

//post - /user/auth/reset-password
router.get("/reset-password/:token", getResetPasswordPage);

//post - /user/auth/verify-password
router.post("/change-password", changePassword);

// Auth logout
router.get("/logout", isAuthenticatedUser, authorizeUser, logout);

module.exports = router;
