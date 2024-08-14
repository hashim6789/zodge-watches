const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const AddressesSchema = new Schema({
  userId: { type: Types.ObjectId, required: true, ref: "User" },
  firstName: { type: String, required: true },
  lastName: { type: String, default: null },
  phoneNo: { type: String, required: true },
  email: { type: String, required: true },
  addressLine: { type: String, required: true },
  pincode: { type: Number, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  updatedAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  city: { type: String, default: null },
  flatNo: { type: String, default: null },
});

const Addresses = mongoose.model("Addresses", AddressesSchema);

module.exports = Addresses;
