const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: String, required: true },
  phoneno: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "USER" },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;
