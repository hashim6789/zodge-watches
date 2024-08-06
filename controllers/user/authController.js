const bcrypt = require("bcryptjs");
require("dotenv").config();
const nodemailer = require("nodemailer");
const UserModel = require("../../models/User");
const OtpModel = require("../../models/Otp");
const { text } = require("body-parser");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use environment variables for security
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerificationMail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    //mail option
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Email",
      text: `Enter ${otp} in the appto verify your email and complete this code is expires in 1 hour.`,
    };

    //for hash the otp
    const hashedOtp = await bcrypt.hash(otp, 15);
    const newOtp = await new OtpModel({
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
    res.json({
      status: "Pending",
      message: "Verification otp main sent",
      data: {
        userId: _id,
        email,
      },
    });
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
    console.log(req.body);
    let user = await UserModel.findOne({ email });
    console.log(user);
    if (!user) {
      const hashPassword = await bcrypt.hash(password, 15);
      user = new UserModel({
        firstName,
        lastName,
        email,
        dob,
        phoneno: phone,
        password: hashPassword,
        isVerified: false,
      });
      await user
        .save()
        .then((result) => {
          //for send the verification mail
          sendVerificationMail(result, res);
        })
        .catch((err) => {
          console.log(err);
          res.json({
            status: "Failed",
            message: "An error occured while saving user account!",
          });
        });
      // return res.status(201).rendirect("/user/pages/home");
    } else {
      return res.status(404).json({
        status: "error",
        message: "The user is already exists",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error creating the category",
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

module.exports = { getSignup, postSignup, getLogin, postLogin };
