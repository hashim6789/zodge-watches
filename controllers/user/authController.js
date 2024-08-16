const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const crypto = require("crypto");
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
    console.log(_id, email);
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
      expiresAt: Date.now() + 3600000,
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

//for get signup
const getSignup = (req, res) => {
  const error = req.query.error;
  res.render("user/signup", { msg: error });
};

// For post signup
const postSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    let user = await UserModel.findOne({ email });
    if (!user) {
      const hashPassword = await bcrypt.hash(password, 10);

      user = new UserModel({
        firstName,
        lastName,
        email,
        password: hashPassword,
        isVerified: false,
      });

      await user.save();

      req.session.user = user;
      sendVerificationMail(user, res);
      return res.redirect(
        `/user/auth/verify-otp?userId=${user._id}&email=${email}`
      );
    } else {
      res.redirect("/user/auth/signup?error=The user already exists!!!");
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      status: "error",
      message: "Signup failed. Please try again later.",
    });
  }
};

//get the otp page
const getOtpPage = (req, res) => {
  const { email, userId, message } = req.query;
  res.render("user/otpGeneratePage", { email, userId, msg: message });
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
        await UserModel.findByIdAndUpdate(
          userId,
          { isVerified: true },
          { new: true }
        );
        res.redirect("/user/auth/home");
      } else {
        res.redirect(
          `/user/auth/verify-otp?userId=${userId}&email=${email}&message=Invalid otp`
        );
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

//for resend otp
const resendOtp = async (req, res) => {
  try {
    const { _id, email } = req.body;
    await sendVerificationMail({ _id, email }, res);
    console.log("Hi", _id, email);

    return res.status(200).json({
      status: "Success",
      message: "OTP resent successfully",
      data: { userId: _id, email: email },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed to resend OTP. Please try again.",
    });
  }
};

//for get signup
const getLogin = (req, res) => {
  const error = req.query.error;
  res.render("user/login", { msg: error });
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
      req.session.user = user;
      res.redirect("/user/auth/home");
      // res.status(200).json({ message: "user login successfully" });
    } else {
      res.redirect(
        "/user/auth/login?error=username or password is incorrect or the user blocked"
      );
      // res
      //   .status(404)
      //   .json({ message: "No user found the database or blocked the user!!!" });
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
  scope: ["profile", "email"],
});

//googleSignupCallback
const googleSignupCallback = (req, res, next) => {
  passport.authenticate("google-signup", {
    failureRedirect: "/user/auth/login?error=The user is already exist",
  })(req, res, next);
};

//googleLoginCallback
const googleLoginCallback = (req, res, next) => {
  passport.authenticate("google-login", {
    failureRedirect: `/user/auth/signup?error=The user is not exist or blocked!!!`,
  })(req, res, next);
};

//for redirect the home page after the otp validation
const redirectToProfile = (req, res) => {
  res.redirect("/user/auth/home");
};

//for get the home page
const getHome = async (req, res) => {
  console.log(req.session);
  const id = req.session?.user?._id || req.session?.passport.user.id;
  const user = await UserModel.findById(id);
  const page = req.query.page || 1;
  const perPage = 8;
  const products = await ProductModel.find({ isListed: true })
    .skip((page - 1) * perPage)
    .limit(perPage);
  const categories = await CategoryModel.find({ isListed: true });
  const count = await ProductModel.countDocuments({ isListed: true });
  console.log(count);
  res.render("user/home", {
    products,
    categories,
    current: page,
    user,
    pages: Math.ceil(count / perPage),
  });
};

//reset password
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(20).toString("hex");
      console.log(token);
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 60 * 10 * 1000;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset",
        text: `Click the following link to reset your password: http://localhost:3000/user/auth/reset-password/${token}`,
      };
      user.save();

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send("Error sending email");
        } else {
          console.log(`Email sent: ${info.response}`);
          res.status(200).json({
            status: "Success",
            message:
              "Check your email for instructions on resetting your password",
          });
        }
      });
    } else {
      res.status(404).send("Email not found");
    }
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server error !!!" });
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

      // res
      //   .status(200)
      //   .json({ status: "Success", message: "Password updated successfully" });
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

const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      res.clearCookie("connect.sid");
      res.redirect("/user/auth/login");
    });
  });
};

module.exports = {
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
};
