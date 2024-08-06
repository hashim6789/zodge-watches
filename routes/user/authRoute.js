const express = require("express");

const {
  getSignup,
  postSignup,
  getOtpPage,
  postOtp,
  getLogin,
  postLogin,
  getHome,
} = require("../../controllers/user/authController");
const router = express.Router();

const test = (req, res) => {
  console.log(req.url);
};

//get the signup page
router.get("/signup", getSignup);

//post the signup page
router.post("/signup", postSignup);

//get otp entering page
router.get("/verify-otp", getOtpPage);

//post otp generator
router.post("/verify-otp", postOtp);

//get home page
router.get("/home", getHome);

//get the login page
router.get("/login", getLogin);

//post the login page
router.post("/login", postLogin);

module.exports = router;
