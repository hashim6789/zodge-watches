// db.js
const mongoose = require("mongoose");

//for mongodb URI
const mongoDbUri = "mongodb://localhost:27017/zodgeDB";

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
