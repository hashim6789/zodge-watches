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
  PORT: parseInt(getEnvVariable("PORT"), 10),
  MONGO_URI: getEnvVariable("MONGO_URI"),
  JWT_SECRET: getEnvVariable("JWT_SECRET"),
  NODE_ENV: getEnvVariable("NODE_ENV"),
  IS_PRODUCTION: getEnvVariable("NODE_ENV") === "production",
  DOMAIN: getEnvVariable("DOMAIN"),
  FRONTEND_URL: getEnvVariable("FRONTEND_URL"),
  CLOUDINARY_CLOUD_NAME: getEnvVariable("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnvVariable("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnvVariable("CLOUDINARY_API_SECRET"),
};
