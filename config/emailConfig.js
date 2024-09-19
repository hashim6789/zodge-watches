require("dotenv").config();

// config/emailConfig.js
const confirmationMailSettings = {
  host: "smtp.gmail.com", // For Gmail
  port: 587, // Use port 587 for TLS
  secure: false, // Use TLS (not SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Disable certificate validation
  },
};

const otpMailSettings = {
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

module.exports = { otpMailSettings, confirmationMailSettings };
