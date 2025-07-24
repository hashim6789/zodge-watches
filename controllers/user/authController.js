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
const HttpStatusCode = require("../../constants/httpStatusCode");
const HttpResponseMessage = require("../../constants/httpResponseMessage");
const HttpStatus = require("../../constants/httpStatus");

require("dotenv").config();

/**-------------for traditional signup and login-------------------- */
const postLocalLogin = async (req, res, next) => {
  passport.authenticate("local-login", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ success: false, message: info.message });
    }

    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      try {
        const wishlist = await WishlistModel.findOne({ userId: user._id });
        const cart = await CartModel.findOne({ userId: user._id });

        return res.status(HttpStatusCode.OK).json({
          success: true,
          message: HttpResponseMessage.SUCCESS.USER_LOGIN,
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
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ success: false, message: info.message });
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

        return res.status(HttpStatusCode.OK).json({
          success: true,
          message: HttpResponseMessage.SUCCESS.USER_SIGNUP,
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
      return res.status(HttpStatusCode.NOT_FOUND).json({
        succes: false,
        message: HttpResponseMessage.ERROR.USER_NOT_FOUND,
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: HttpResponseMessage.ERROR.OTP_EXPIRED,
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: HttpResponseMessage.ERROR.INVALID_OTP,
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: HttpResponseMessage.SUCCESS.USER_VERIFY,
    });
  } catch (error) {
    // console.error("Error in verifyOtp:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: HttpResponseMessage.ERROR.SERVER_ERROR });
  }
};

//for get signup
const getSignup = (req, res) => {
  try {
    const error = req.query.error;
    res.render("user/signup", { msg: error });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
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
    res.status(HttpStatusCode, HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

//for resend otp
const resendOtp = async (req, res) => {
  try {
    const _id = req.user?._id;
    const email = req.user?.email;
    await sendVerificationMail({ _id, email }, res);

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: HttpResponseMessage.SUCCESS.OTP_RESEND,
      data: { userId: _id, email: email },
    });
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.FAILED,
      message: HttpResponseMessage.ERROR.OTP_RESEND,
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
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
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
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
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
      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: HttpResponseMessage.SUCCESS.EMAIL_SENT,
      });
    } else {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: HttpResponseMessage.ERROR.EMAIL_NOT_FOUND,
      });
    }
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

//for reset password page
const getResetPasswordPage = async (req, res) => {
  try {
    const token = req.params.token;
    const user = await UserModel.findOne({ resetPasswordToken: token });
    if (user) {
      res.status(HttpStatusCode.OK).render("user/resetPassword", { token });
    } else {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .json(HttpResponseMessage.ERROR.TOKEN_EXPIRED);
    }
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.FAILED,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
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
      res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.USER_NOT_FOUND,
      });
    }
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.FAILED,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

// POST route to validate current password
const validateCurrentPassword = async (req, res) => {
  try {
    const { userId, currentPassword } = req.body;

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.USER_NOT_FOUND,
      });
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: HttpResponseMessage.ERROR.USER_NOT_FOUND,
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (isMatch) {
      return res.status(HttpStatusCode.OK).json({
        success: true,
        message: HttpResponseMessage.SUCCESS.PASSWORD_CORRECT,
      });
    } else {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: HttpResponseMessage.ERROR.PASSWORD_INCORRECT,
      });
    }
  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

const changeUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: HttpResponseMessage.ERROR.USER_NOT_FOUND });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res
      .status(HttpStatusCode.OK)
      .json({ message: HttpResponseMessage.SUCCESS.PASSWORD_UPDATE });
  } catch (error) {
    return res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: HttpResponseMessage.ERROR.SERVER_ERROR });
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
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
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
