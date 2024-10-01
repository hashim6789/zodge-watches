require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB URI from .env file
const mongoDbUri =
  process.env.mongoDbUri || "mongodb://localhost:27017/zodgeDB";

// Log the URI to verify it's correct
console.log("MongoDB URI:", mongoDbUri);

const connectDB = async () => {
  try {
    await mongoose.connect(mongoDbUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
