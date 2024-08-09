const express = require("express");
const router = express.Router();

//for Authentication
const {
  isAuthenticatedUser,
  redirectIfAuthenticated,
} = require("../../middlewares/authenticationMiddlewares");

//for Authorization
const { authorizeUser } = require("../../middlewares/authorizationMiddlewares");

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
  logout,
} = require("../../controllers/user/authController");

const test = (req, res, next) => {
  console.log(req.url);
  next();
};

//get the signup page
router.get("/signup", redirectIfAuthenticated, getSignup);

//post the signup page
router.post("/signup", redirectIfAuthenticated, postSignup);

//get otp entering page
router.get("/verify-otp", isAuthenticatedUser, authorizeUser, getOtpPage);

//post otp generator
router.post("/verify-otp", isAuthenticatedUser, authorizeUser, postOtp);

//post otp resend
router.post("/resend-otp", isAuthenticatedUser, authorizeUser, resendOtp);

//get the login page
router.get("/login", redirectIfAuthenticated, getLogin);

//post the login page
router.post("/login", redirectIfAuthenticated, postLogin);

// Auth with Google for signup
router.get("/google/signup", redirectIfAuthenticated, googleSignup);

// Auth with Google for login
router.get("/google/login", redirectIfAuthenticated, googleLogin);

// Callback route for Google to redirect to for signup
router.get(
  "/google/signup/callback",
  redirectIfAuthenticated,
  googleSignupCallback,
  redirectToProfile
);

// Callback route for Google to redirect to for login
router.get(
  "/google/login/callback",
  redirectIfAuthenticated,
  googleLoginCallback,
  redirectToProfile
);

// Auth logout
router.get("/logout", isAuthenticatedUser, authorizeUser, logout);

//get home page
router.get("/home", isAuthenticatedUser, authorizeUser, getHome);

module.exports = router;
