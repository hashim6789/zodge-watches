const express = require("express");
const {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
} = require("../../controllers/user/authController");
const router = express.Router();

//get the signup page
router.get("/signup", getSignup);

//post the signup page
router.post("/signup", postSignup);

//get the login page
router.get("/login", getLogin);

//post the login page
router.post("/login", postLogin);

module.exports = router;
