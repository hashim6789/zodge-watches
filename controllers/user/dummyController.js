const ProductModel = require("../../models/ProductModel");
const CategoryModel = require("../../models/Category");
const UserModel = require("../../models/User");

// const dummy = async (req, res) => {
//   // const products = await ProductModel.find({ isListed: true });
//   // const categories = await CategoryModel.find({ isListed: true });
//   const user = await UserModel.findOne({
//     email: "muhammedhashim6789@gmail.com",
//   });
//   const address = {
//     userId: "64e61b9d4f60d6c3bca1e97d", // Example ObjectId
//     firstName: "John",
//     phoneNo: "+1234567890",
//     email: "john.doe@example.com",
//     address: "123 Main Street, Apt 4B",
//     pinCode: 123456,
//     state: "California",
//     country: "USA",
//     city: "Los Angeles",
//     flatNo: "4B",
//   };

// console.log(categories);
// res.render("user/account-profile", { user, addresses: [address] });

// res.render("user/home", { products, categories });
// res.render("user/otpGeneratePage", { msg: null });
// };
const user = {
  _id: "66be0418910daec07a9d471f",
  googleId: "111383475093210749540",
  firstName: "Muhammed ",
  lastName: "Hashim PS",
  email: "muhammedhashim6789@gmail.com",
  password: "$2a$10$YtnN54riASIjyLVxWr2r5Obq3Vt9kDvYohOlLjVDpNrNZHIgOx3Bq",
  role: "User",
  isBlocked: false,
  isVerified: true,
  createdAt: "2024-08-15T13:35:20.892Z",
  updatedAt: "2024-08-15T13:35:20.893Z",
  __v: 0,
  thumbnail:
    "https://lh3.googleusercontent.com/a/ACg8ocKT4baXpxa-mFTXXIulJz_DU0pYWn-ZoCoFnNiUgpcgfOwG6g=s96-c",
  resetPasswordExpires: "1723902159187",
  resetPasswordToken: "dafbff5b74e873affb8750845580b1357c3dcff5",
};

const cart = {
  products: [
    {
      productId: "60d21b4667d0d8992e610c85", // Example ObjectId
      name: "Fresh Strawberries",
      price: 36.0,
      quantity: 1,
      image: "/public/user/images/item-cart-04.jpg",
    },
    {
      productId: "60d21b4667d0d8992e610c86", // Example ObjectId
      name: "Lightweight Jacket",
      price: 16.0,
      quantity: 1,
      image: "/public/user/images/item-cart-05.jpg",
    },
  ],
  totalPrice: 52.0,
  updatedAt: new Date(),
  createdAt: new Date(),
  userId: "60d21b4667d0d8992e610c87", // Example ObjectId
};

// const dummy = (req, res) => {
//   res.render("user/cartPage", { user, cart });
// };
const dummy = async (req, res) => {
  const productId = req.params.productId || "66b20c63179e1372e3854593";
  const userId =
    req.session?.user?._id ||
    req.session?.passport?.user?.id ||
    "66ba12a0b60c8ee3d46812fd";
  const user = await UserModel.findById(userId);
  const product = await ProductModel.findById(productId);
  res.render("user/product_details", { user, product, ratings: 4 });
};

module.exports = { dummy };
