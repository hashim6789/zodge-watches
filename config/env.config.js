const dotenv = require("dotenv");

dotenv.config();

function getEnvVariable(key, required = true) {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || "";
}

const ENV = {
  MONGO_URI: getEnvVariable("MONGO_URI"),
  NODE_ENV: getEnvVariable("NODE_ENV"),
  EMAIL_USER: getEnvVariable("EMAIL_USER"),
  EMAIL_PASS: getEnvVariable("EMAIL_PASS"),
  GOOGLE_CLIENT_ID: getEnvVariable("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnvVariable("GOOGLE_CLIENT_SECRET"),
  RAZORPAY_KEY_ID: getEnvVariable("RAZORPAY_KEY_ID"),
  RAZORPAY_KEY_SECRET: getEnvVariable("RAZORPAY_KEY_SECRET"),
  ADMIN_EMAIL: getEnvVariable("ADMIN_EMAIL"),
  ADMIN_PASSWORD: getEnvVariable("ADMIN_PASSWORD"),
  ADMIN_ROLE: getEnvVariable("ADMIN_ROLE"),
  ADMIN_PERMISSIONS: getEnvVariable("ADMIN_PERMISSIONS"),
  CALLBACK_URL_LOGIN: getEnvVariable("CALLBACK_URL_LOGIN"),
  CALLBACK_URL_SIGNUP: getEnvVariable("CALLBACK_URL_SIGNUP"),
};

module.exports = { ENV };
