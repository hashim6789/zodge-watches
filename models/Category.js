const mongoose = require("mongoose");

const { Schema, ObjectId } = mongoose;

const CategoriesSchema = new Schema({
  name: { type: String, required: true },
  isListed: { type: Boolean, default: true, required: true },
});

const Categories = mongoose.model("Categories", CategoriesSchema);

module.exports = Categories;
