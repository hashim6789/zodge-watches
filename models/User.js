const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const UsersSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  phoneno: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["admin", "user"] },
  updatedAt: { type: Date, required: true },
  isBlocked: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, required: true },
});

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;
