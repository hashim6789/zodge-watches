const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  googleId: { type: String },
  thumbnail: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String }, // Optional for Google signups
  role: { type: String, default: "User" },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // Marked the true when the otp is verified and signup with google
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;
