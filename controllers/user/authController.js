const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const crypto = require("crypto");
const UserModel = require("../../models/User");
const OtpModel = require("../../models/Otp");
const ProductModel = require("../../models/Product");
const CategoryModel = require("../../models/Category");
const CartModel = require("../../models/Cart");
const WishlistModel = require("../../models/Wishlist");
require("dotenv").config();

/**--------------------for mail activities------------------ */

//for creating a nodemail transporter
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

//for sending the verification mail or otp
const sendVerificationMail = async ({ _id, email }, res) => {
  try {
    console.log(_id, email);
    // Generate a 4-digit OTP
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email and complete the signup process. This code <b>expires in 1 hour</b>.</p>`,
    };

    // Hash the OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update the user's OTP fields directly in the Users collection
    await UserModel.findByIdAndUpdate(_id, {
      otp: hashedOtp,
      otpExpires: Date.now() + 1000 * 60 * 10, // OTP expires in 10 minutes
      updatedAt: Date.now(),
    });

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          status: "Failed",
          message: "Error sending email. Please try again later.",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          status: "Pending",
          message: "Verification OTP email sent",
          data: { userId: _id, email },
        });
      }
    });
  } catch (error) {
    console.error("Error in sendVerificationMail:", error);
    res.status(500).json({
      status: "Failed",
      message: "An error occurred while sending verification mail.",
    });
  }
};

/**-------------for traditional signup and login-------------------- */

const postLocalLogin = async (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/auth/login?error=" + info.message);
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      const returnTo = req.session.returnTo || "/";
      delete req.session.returnTo;
      return res.redirect(returnTo);
    });
  })(req, res, next);
};

const postLocalSignup = async (req, res, next) => {
  passport.authenticate("local-signup", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/auth/signup?error=" + info.message);
    }
    console.log(req.user);
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log(user);

      // Optionally, send verification email
      sendVerificationMail(user, res);

      return res.redirect(`/auth/otp`);
    });
  })(req, res, next);
};

const verifyOtp = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, userId, email } = req.body;
    const otp = `${otp1}${otp2}${otp3}${otp4}`;
    // Find the user by ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if OTP is expired
    if (user.otpExpires < Date.now()) {
      return res.redirect("/auth/otp?message=OTP has expired.");
      // return res
      //   .status(400)
      //   .json({ message: "OTP has expired. Please request a new one." });
    }

    // Verify the OTP
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).redirect("/auth/otp?message=Invalid OTP");
      // return res
      //   .status(400)
      //   .json({ message: "Invalid OTP. Please try again." });
    }

    // Mark the user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined; // Clear OTP after verification
    user.otpExpires = undefined; // Clear OTP expiration
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).redirect("/");
    // res.status(200).json({ message: "User verified successfully." });
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

// // For post signup
// const postSignup = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;

//     let user = await UserModel.findOne({ email });
//     if (!user) {
//       const hashPassword = await bcrypt.hash(password, 10);

//       user = new UserModel({
//         firstName,
//         lastName,
//         email,
//         password: hashPassword,
//         isVerified: false,
//       });

//       await user.save();

//       req.session.user = user;
//       sendVerificationMail(user, res);
//       return res.redirect(`/auth/verify-otp?userId=${user._id}&email=${email}`);
//     } else {
//       res.redirect("/auth/signup?error=The user already exists!!!");
//     }
//   } catch (error) {
//     console.error("Signup error:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Signup failed. Please try again later.",
//     });
//   }
// };

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

//post the otp (verifying)
// const postOtp = async (req, res) => {
//   try {
//     const { otp1, otp2, otp3, otp4, userId, email } = req.body;
//     const otp = `${otp1}${otp2}${otp3}${otp4}`;

//     const otpRecord = await OtpModel.findOne({ userId });
//     console.log(req.body);

//     if (otpRecord && Date.now() < otpRecord.expiresAt) {
//       const isValidOtp = await bcrypt.compare(otp, otpRecord.otp);

//       if (isValidOtp) {
//         await UserModel.findByIdAndUpdate(
//           userId,
//           { isVerified: true },
//           { new: true }
//         );

//         res.redirect("/");
//       } else {
//         res.redirect(
//           `/auth/verify-otp?userId=${userId}&email=${email}&message=Invalid otp`
//         );
//       }
//     } else {
//       res.render("user/otpGeneratePage", {
//         email,
//         userId,
//         msg: "OTP expired or not found",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       status: "Failed",
//       message: error.message,
//     });
//   }
// };

// //for resend the sending otp
// const resendOTP = async (req, res) => {
//   try {
//     sendVerificationMail(req.user, res);
//   } catch (err) {
//     res.status(500).json({
//       status: "Error",
//       message: "The server error",
//     });
//   }
// };

//for resend otp
const resendOtp = async (req, res) => {
  try {
    const { _id, email } = req.body;
    await sendVerificationMail({ _id, email }, res);

    return res.status(200).json({
      status: "Success",
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

//for post Login
// const postLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     let user = await UserModel.findOne({ email });
//     if (
//       user &&
//       (await bcrypt.compare(password, user.password)) &&
//       user.isBlocked === false
//     ) {
//       req.session.user = user;
//       const returnTo = req.session.returnTo || "/";
//       delete req.session.returnTo;
//       res.redirect(returnTo);
//       // res.status(200).json({ message: "user login successfully" });
//     } else {
//       res.redirect(
//         "/auth/login?error=username or password is incorrect or the user blocked"
//       );
//       // res
//       //   .status(404)
//       //   .json({ message: "No user found the database or blocked the user!!!" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: "server error!!!" });
//   }
// };

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
    failureRedirect: "/auth/login?error=The user is already exist",
  })(req, res, next);
};

//googleLoginCallback
const googleLoginCallback = (req, res, next) => {
  passport.authenticate("google-login", {
    failureRedirect: `/auth/signup?error=The user is not exist or blocked!!!`,
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

//for get the home page
// const getHome = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     let user = null;
//     if (userId) {
//       user = await UserModel.findById(userId);
//     }
//     // console.log(req.user);
//     const page = req.query.page || 1;
//     const perPage = 8;
//     const products = await ProductModel.find()
//       .skip((page - 1) * perPage)
//       .limit(perPage);
//     const categories = await CategoryModel.find({ isListed: true });
//     const count = await ProductModel.countDocuments();

//     let cart = null;
//     let wishlist = null;
//     if (userId) {
//       cart = await CartModel.findOne({ userId });
//       if (!cart) {
//         cart = new CartModel({
//           userId,
//           products: [],
//           totalPrice: 0,
//           createdAt: Date.now(),
//           updatedAt: Date.now(),
//         });
//         cart.save();
//       }
//       wishlist = await WishlistModel.findOne({ userId }).populate(
//         "productIds",
//         "name price images"
//       );
//       // console.log(wishlist);
//       if (!wishlist) {
//         wishlist = new WishlistModel({
//           userId,
//           productIds: [],
//           createdAt: Date.now(),
//           updatedAt: Date.now(),
//         });
//         wishlist.save();
//       }
//     }
//     console.log(cart);

//     res.render("user/home", {
//       products,
//       categories,
//       current: page,
//       user,
//       wishlist,
//       pages: Math.ceil(count / perPage),
//       cart,
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "Error",
//       message: "The server error",
//     });
//   }
// };

/**The user can reset the password */

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
        text: `Click the following link to reset your password: http://localhost:3000/auth/reset-password/${token}`,
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
  resetPassword,
  changePassword,
  getResetPasswordPage,
  logout,
};
