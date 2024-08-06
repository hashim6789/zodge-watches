const ProductModel = require("../../models/ProductModel");
const CategoryModel = require("../../models/Category");

const dummy = async (req, res) => {
  const products = await ProductModel.find({ isListed: true });
  const categories = await CategoryModel.find({ isListed: true });
  console.log(categories);

  res.render("user/home", { products, categories });
  res.render("user/otpGeneratePage", { msg: null });
};

module.exports = { dummy };
