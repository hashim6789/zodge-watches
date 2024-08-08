const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const UserModel = require("../../models/User");
const OtpModel = require("../../models/Otp");
const ProductModel = require("../../models/ProductModel");
const CategoryModel = require("../../models/Category");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerificationMail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email and complete the signup process. This code <b>expires in 1 hour</b>.</p>`,
    };

    const hashedOtp = await bcrypt.hash(otp, 10);
    const newOtp = new OtpModel({
      userId: _id,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    //for save otp records
    await newOtp.save();
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    // return res.json({
    //   status: "Pending",
    //   message: "Verification OTP email sent",
    //   data: { userId: _id, email },
    // });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// Verify environment variables (for debugging)
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
//for get signup
const getSignup = (req, res) => {
  res.render("user/signup", { msg: null });
};

//for post signup
const postSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, dob, phone, password } = req.body;

    let user = await UserModel.findOne({ email });
    if (!user) {
      const hashPassword = await bcrypt.hash(password, 10);
      user = new UserModel({
        firstName,
        lastName,
        email,
        dob,
        phoneno: phone,
        password: hashPassword,
        isVerified: false,
      });
      await user.save();
      sendVerificationMail(user, res);
      return res.redirect(
        `/user/auth/verify-otp?userId=${user._id}&email=${email}`
      );
    } else {
      return res.status(404).json({
        status: "error",
        message: "The user is already exists",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error signup failed",
    });
  }
};

//get the otp page
const getOtpPage = (req, res) => {
  const { email, userId } = req.query;
  res.render("user/otpGeneratePage", { email, userId, msg: null });
};

//post the otp (verifying)
const postOtp = async (req, res) => {
  const { otp1, otp2, otp3, otp4, userId, email } = req.body;
  const otp = `${otp1}${otp2}${otp3}${otp4}`;

  try {
    const otpRecord = await OtpModel.findOne({ userId });
    console.log(req.body);

    if (otpRecord && Date.now() < otpRecord.expiresAt) {
      const isValidOtp = await bcrypt.compare(otp, otpRecord.otp);

      if (isValidOtp) {
        //verified the user
        await UserModel.findByIdAndUpdate(
          userId,
          { isVerified: true },
          { new: true } // Return the updated document
        );
        // OTP is correct, navigate to the home page
        res.redirect("/user/auth/home");
      } else {
        res.render("user/otpGeneratePage", {
          email,
          userId,
          msg: "Invalid OTP",
        });
      }
    } else {
      res.render("user/otpGeneratePage", {
        email,
        userId,
        msg: "OTP expired or not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

//for get signup
const getLogin = (req, res) => {
  res.render("user/login", { msg: null });
};

//for post Login
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await UserModel.findOne({ email });
    if (
      user &&
      (await bcrypt.compare(password, user.password)) &&
      user.isBlocked === false
    ) {
      console.log(user);
      // req.session.userId = user._id;
      // res.redirect("/user/pages/home");
      res.status(200).json({ message: "user login successfully" });
    } else {
      res.status(404).json({ message: "No user found the database!!!" });
    }
  } catch (err) {
    res.status(500).json({ message: "server error!!!" });
  }
};

/**-----------------google--------------- */

const googleSignup = passport.authenticate("google-signup", {
  scope: ["profile", "email"],
});

const googleLogin = passport.authenticate("google-login", {
  scope: ["profile"],
});

// Corrected way to define the googleSignupCallback
const googleSignupCallback = (req, res, next) => {
  passport.authenticate("google-signup", {
    failureRedirect: "/user/auth/login",
  })(req, res, next);
};

// Corrected way to define the googleLoginCallback
const googleLoginCallback = (req, res, next) => {
  passport.authenticate("google-login", {
    failureRedirect: "/user/auth/login",
  })(req, res, next);
};

// After authentication, redirect to profile in a separate function
const redirectToProfile = (req, res) => {
  res.redirect("/user/auth/home");
};

const getHome = async (req, res) => {
  const products = await ProductModel.find({ isListed: true });
  const categories = await CategoryModel.find({ isListed: true });

  res.render("user/home", { products, categories });
};

const logout = (req, res) => {
  req.logout();
  res.redirect("/");
};

module.exports = {
  getSignup,
  postSignup,
  getOtpPage,
  postOtp,
  getLogin,
  postLogin,
  googleSignup,
  googleLogin,
  googleSignupCallback,
  googleLoginCallback,
  redirectToProfile,
  getHome,
  logout,
};
