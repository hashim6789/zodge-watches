const ProductModel = require("../../models/ProductModel");
const CategoryModel = require("../../models/Category");
const UserModel = require("../../models/User");

const dummy = async (req, res) => {
  // const products = await ProductModel.find({ isListed: true });
  // const categories = await CategoryModel.find({ isListed: true });
  const user = await UserModel.findOne({
    email: "muhammedhashim6789@gmail.com",
  });
  const address = {
    userId: "64e61b9d4f60d6c3bca1e97d", // Example ObjectId
    firstName: "John",
    phoneNo: "+1234567890",
    email: "john.doe@example.com",
    address: "123 Main Street, Apt 4B",
    pinCode: 123456,
    state: "California",
    country: "USA",
    city: "Los Angeles",
    flatNo: "4B",
  };

  // console.log(categories);
  res.render("user/account-profile", { user, addresses: [address] });

  // res.render("user/home", { products, categories });
  // res.render("user/otpGeneratePage", { msg: null });
};

// const dummy = (req, res) => {};

module.exports = { dummy };
