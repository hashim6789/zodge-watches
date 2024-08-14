// User model file
const mongoose = require("mongoose");

const { Schema } = mongoose;

const UsersSchema = new Schema({
  googleId: { type: String, default: null },
  thumbnail: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: String },

  role: { type: String, default: "User" },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;
