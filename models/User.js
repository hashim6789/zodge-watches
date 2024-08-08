const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  googleId: { type: String, required: true },
  thumbnail: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String }, // Optional for Google signups
  role: { type: String, default: "USER" },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, required: true, default: false }, // Mark Google signups as verified
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;
