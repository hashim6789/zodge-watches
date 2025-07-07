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
  ADMIN_PERMISSIONS: getEnvVariable("ADMIN_PERMISSIONS"),
  DOMAIN_NAME: getEnvVariable("DOMAIN_NAME"),
  NODE_ENV: getEnvVariable("NODE_ENV"),
  PORT: getEnvVariable("PORT"),
  ADMIN_EMAIL: getEnvVariable("ADMIN_EMAIL"),
  ADMIN_PASSWORD: getEnvVariable("ADMIN_PASSWORD"),
  ADMIN_ROLE: getEnvVariable("ADMIN_ROLE"),
  MONGO_URI: getEnvVariable("MONGO_URI"),
  GOOGLE_CLIENT_ID: getEnvVariable("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnvVariable("GOOGLE_CLIENT_SECRET"),
  EMAIL_USER: getEnvVariable("EMAIL_USER"),
  EMAIL_PASS: getEnvVariable("EMAIL_PASS"),
  RAZORPAY_KEY_ID: getEnvVariable("RAZORPAY_KEY_ID"),
  RAZORPAY_KEY_SECRET: getEnvVariable("RAZORPAY_KEY_SECRET"),
  CALLBACK_URL_LOGIN: getEnvVariable("CALLBACK_URL_LOGIN"),
  CALLBACK_URL_SIGNUP: getEnvVariable("CALLBACK_URL_SIGNUP"),
};

module.exports = { ENV };
