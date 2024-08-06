const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const OtpSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: "User" },
  otp: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

const Otp = mongoose.model("Otp", OtpSchema);

module.exports = Otp;
