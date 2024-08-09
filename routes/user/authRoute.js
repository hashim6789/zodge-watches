const express = require("express");

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
const router = express.Router();

const test = (req, res, next) => {
  console.log(req.url);
  next();
};

//get the signup page
router.get("/signup", getSignup);

//post the signup page
router.post("/signup", postSignup);

//get otp entering page
router.get("/verify-otp", getOtpPage);

//post otp generator
router.post("/verify-otp", postOtp);

//post otp resend
router.post("/resend-otp", test, resendOtp);

//get the login page
router.get("/login", getLogin);

//post the login page
router.post("/login", postLogin);

// Auth with Google for signup
router.get("/google/signup", googleSignup);

// Auth with Google for login
router.get("/google/login", test, googleLogin);

// Callback route for Google to redirect to for signup
router.get("/google/signup/callback", googleSignupCallback, redirectToProfile);

// Callback route for Google to redirect to for login
router.get(
  "/google/login/callback",
  test,
  googleLoginCallback,
  redirectToProfile
);

// Auth logout
router.get("/logout", logout);

//get home page
router.get("/home", getHome);

module.exports = router;
