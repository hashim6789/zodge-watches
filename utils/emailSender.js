const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const ejs = require("ejs");
const path = require("path");

const OrderModel = require("../models/Order");
const UserModel = require("../models/User");
const {
  confirmationMailSettings,
  otpMailSettings,
} = require("../config/emailConfig");
const { ENV } = require("../config/env.config");

// Create the email transporter using the config
const transporter = nodemailer.createTransport(confirmationMailSettings);

async function sendOrderConfirmationEmail(order) {
  try {
    const populatedOrder = await OrderModel.findById(order._id).populate(
      "products.productId",
      "name, images"
    );
    console.log(order);
    // Render the EJS template for the email
    const template = await ejs.renderFile(
      path.join(__dirname, "../views/user/confirmationMail.ejs"),
      { order: populatedOrder }
    );

    // Set email options
    const mailOptions = {
      from: '"Your Store" <noreply@yourstore.com>',
      to: order.address.email,
      subject: `Order Confirmation - #${order.orderId}`,
      html: template,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
}

/**--------------------for mail activities------------------ */

//for sending the verification mail or otp
const sendVerificationMail = async ({ _id, email }, res) => {
  try {
    console.log(_id, email);
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

    const mailOptions = {
      from: ENV.EMAIL_USER,
      to: email,
      subject: "Verify your Email",
      html: `<p>Enter <b>${otp}</b> in the app to verify your email and complete the signup process. This code <b>expires in 1 hour</b>.</p>`,
    };

    const hashedOtp = await bcrypt.hash(otp, 10);

    await UserModel.findByIdAndUpdate(_id, {
      otp: hashedOtp,
      otpExpires: Date.now() + 1000 * 60 * 10,
      updatedAt: Date.now(),
    });

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

const sendForgotPasswordMail = async (user, email) => {
  try {
    const token = crypto.randomBytes(20).toString("hex");
    console.log(token);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 10 * 1000;

    const mailOptions = {
      from: ENV.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: ${ENV.DOMAIN_NAME}/auth/reset-password/${token}`,
    };
    user.save();

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error sending email");
      } else {
        console.log(`Email sent: ${info.response}`);
        res.status(200).json({
          success: true,
          message:
            "Check your email for instructions on resetting your password",
        });
      }
    });
  } catch (error) {
    console.error("Error in sendForgotPasswordMail:", error);
    res.status(500).json({
      status: "Failed",
      message: "An error occurred while sending forgot password mail.",
    });
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendVerificationMail,
  sendForgotPasswordMail,
};
