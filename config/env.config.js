import dotenv from "dotenv";

dotenv.config();

function getEnvVariable(key, required = true) {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || "";
}

export const ENV = {
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

  PORT: parseInt(getEnvVariable("PORT"), 10),
  JWT_SECRET: getEnvVariable("JWT_SECRET"),
  IS_PRODUCTION: getEnvVariable("NODE_ENV") === "production",
  DOMAIN: getEnvVariable("DOMAIN"),
  FRONTEND_URL: getEnvVariable("FRONTEND_URL"),
  CLOUDINARY_CLOUD_NAME: getEnvVariable("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnvVariable("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnvVariable("CLOUDINARY_API_SECRET"),
};
