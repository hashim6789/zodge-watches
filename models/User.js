const mongoose = require("mongoose");

const { Schema } = mongoose;

const UsersSchema = new Schema(
  {
    googleId: { type: String, default: null },
    thumbnail: { type: String, default: null },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: String, default: "User" },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;
