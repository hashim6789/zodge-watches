const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const UserModel = require("../../models/User");
const WishlistModel = require("../../models/Wishlist");
const CartModel = require("../../models/Cart");

const {
  sendVerificationMail,
  sendForgotPasswordMail,
} = require("../../utils/emailSender");

require("dotenv").config();

/**-------------for traditional signup and login-------------------- */
const postLocalLogin = async (req, res, next) => {
  console.log("signup");
  passport.authenticate("local-login", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: info.message });
    }

    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      try {
        const wishlist = await WishlistModel.findOne({ userId: user._id });
        const cart = await CartModel.findOne({ userId: user._id });

        return res.status(200).json({
          success: true,
          message: "User login successfully",
          wishlist: wishlist ? wishlist.productIds : [],
          cart,
        });
      } catch (dbError) {
        return next(dbError);
      }
    });
  })(req, res, next);
};

const postLocalSignup = async (req, res, next) => {
  passport.authenticate("local-signup", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: info.message });
    }

    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      try {
        await sendVerificationMail(user, res);

        const wishlist = await WishlistModel.create({
          userId: user._id,
          productIds: [],
        });

        const cart = await CartModel.create({
          userId: user._id,
          products: [],
          totalPrice: 0,
        });

        return res.status(200).json({
          success: true,
          message: "User signup successful",
          wishlist: wishlist.productIds,
          cart,
        });
      } catch (dbError) {
        return next(dbError);
      }
    });
  })(req, res, next);
};

const verifyOtp = async (req, res) => {
  try {
    const userId = req.user?._id;
    const email = req.user?.email;
    const { otp } = req.body;
    console.log(otp);
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ succes: false, message: "User not found." });
    }

    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired." });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "the user verified successful" });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

//for get signup
const getSignup = (req, res) => {
  try {
    const error = req.query.error;
    res.render("user/signup", { msg: error });
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

//get the otp page
const getOtpPage = (req, res) => {
  try {
    const message = req.query.message || "";
    const { email, _id } = req.user;
    res.render("user/otpGeneratePage", { email, userId: _id, msg: message });
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

//for resend otp
const resendOtp = async (req, res) => {
  try {
    const _id = req.user?._id;
    const email = req.user?.email;
    await sendVerificationMail({ _id, email }, res);

    return res.status(200).json({
      success: true,
      message: "OTP resend successfully",
      data: { userId: _id, email: email },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed to resend OTP. Please try again.",
    });
  }
};

//for get login
const getLogin = (req, res) => {
  try {
    console.log("get login page");
    const error = req.query.error || "";
    res.render("user/login", { msg: error });
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

/**-----------------google signup and login--------------- */

const googleSignup = passport.authenticate("google-signup", {
  scope: ["profile", "email"],
});

const googleLogin = passport.authenticate("google-login", {
  scope: ["profile", "email"],
});

//googleSignupCallback
const googleSignupCallback = (req, res, next) => {
  passport.authenticate("google-signup", {
    failureRedirect: "/",
  })(req, res, next);
};

//googleLoginCallback
const googleLoginCallback = (req, res, next) => {
  passport.authenticate("google-login", {
    failureRedirect: `/`,
  })(req, res, next);
};

//for redirect the home page after google login and google signup
const redirectToProfile = (req, res) => {
  try {
    console.log("HI", req.session.returnTo);
    res.redirect("/");
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

//reset password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      await sendForgotPasswordMail(user, email);
      return res
        .status(200)
        .json({ success: true, message: "The mail is sent successfully" });
    } else {
      res.status(404).json({ success: false, message: "Email not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error !!!" });
  }
};

//for reset password page
const getResetPasswordPage = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await UserModel.findOne({ resetPasswordToken: token });
    if (user) {
      res.status(200).render("user/resetPassword", { token });
    } else {
      res.status(404).json("Invalid or expired token");
    }
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Server error!!!",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log(token);
    const user = await UserModel.findOne({ resetPasswordToken: token });
    if (user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.resetExpires = undefined;
      user.resetToken = undefined;

      await user.save();

      res.render("user/password_success");
    } else {
      res.status(404).json({ status: "Failure", message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: "server error!!!",
    });
  }
};

// POST route to validate current password
const validateCurrentPassword = async (req, res) => {
  try {
    const { userId, currentPassword } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (isMatch) {
      return res
        .status(200)
        .json({ success: true, message: "Password is correct" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect current password" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/**------------------logout the user----------------- */

const logout = (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }

      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }

        res.clearCookie("connect.sid");
        res.redirect("/");
      });
    });
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

module.exports = {
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
};
