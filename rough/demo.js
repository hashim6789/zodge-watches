// let user = {
//   name: "hashim",
//   age: 20,
//   address: {
//     place: "calicut",
//     pincode: 23213123,
//   },
// };

// // let shallow = { ...user };
// // shallow.address.pincode = 123456;
// // console.log(user.address.pincode);

// const deep = JSON.parse(JSON.stringify(originalObject));
// deep.

const products = [
  {
    name: "Premium Watch A",
    description: "A luxury watch with a sleek design.",
    categoryId: 1,
    price: 299.99,
    stock: 50,
    images: ["image1.jpg", "image2.jpg"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    name: "Premium Watch B",
    description: "A stylish watch perfect for any occasion.",
    categoryId: 2,
    price: 199.99,
    stock: 30,
    images: ["image3.jpg", "image4.jpg"],
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    name: "Premium Watch C",
    description: "A watch with cutting-edge technology.",
    categoryId: 3,
    price: 399.99,
    stock: 20,
    images: ["image5.jpg", "image6.jpg"],
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    name: "Premium Watch D",
    description: "An elegant watch for special occasions.",
    categoryId: 1,
    price: 249.99,
    stock: 40,
    images: ["image7.jpg", "image8.jpg"],
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
  },
  {
    name: "Premium Watch E",
    description: "A rugged watch for outdoor adventures.",
    categoryId: 2,
    price: 149.99,
    stock: 60,
    images: ["image9.jpg", "image10.jpg"],
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-05-01T00:00:00Z",
  },
];


<!-- Block2 -->
<!-- <div id="product-list" class="row isotope-grid">
  <% products.forEach(function(product) { %>
  <div
    class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item <%= product.category %>"
  >
    <div class="block2">
      <div class="block2-pic hov-img0">
        <img src="<%= product.imgSrc %>" alt="IMG-PRODUCT" />

        <a
          href="#"
          class="block2-btn flex-c-m stext-103 cl2 size-102 bg0 bor2 hov-btn1 p-lr-15 trans-04 js-show-modal1"
        >
          Quick View
        </a>
      </div>

      <div class="block2-txt flex-w flex-t p-t-14">
        <div class="block2-txt-child1 flex-col-l">
          <a
            href="<%= product.detailPage %>"
            class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6"
          >
            <%= product.name %>
          </a>

          <span class="stext-105 cl3"> <%= product.price %> </span>
        </div>

        <div class="block2-txt-child2 flex-r p-t-3">
          <a
            href="#"
            class="btn-addwish-b2 dis-block pos-relative js-addwish-b2"
            data-id="<%= product.id %>"
          >
            <img
              class="icon-heart1 dis-block trans-04"
              src="<%= product.wishListIcon.default %>"
              alt="ICON"
            />
            <img
              class="icon-heart2 dis-block trans-04 ab-t-l"
              src="<%= product.wishListIcon.active %>"
              alt="ICON"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
  <% }); %>
</div> -->




const orders = await OrderModel.find()
.populate("userId", "firstName lastName email") // populate user details
.populate("products.productId", "name price") // populate product details
.skip((page - 1) * perPage)
.limit(perPage);

console.log(orders);

const count = await OrderModel.countDocuments();






// const nodemailer = require("nodemailer");
// const bcrypt = require("bcryptjs");
// const passport = require("passport");
// const crypto = require("crypto");
// const UserModel = require("../../models/User");
// const OtpModel = require("../../models/Otp");
// const ProductModel = require("../../models/Product");
// const CategoryModel = require("../../models/Category");
// const CartModel = require("../../models/Cart");
// const WishlistModel = require("../../models/Wishlist");
// require("dotenv").config();

// /**--------------------for mail activities------------------ */

// const AddressModel = require("../../models/Address");
// const UserModel = require("../../models/User");
// const OrderModel = require("../../models/Order");

// //get the account profile page
// // const getAccount = async (req, res) => {
// //   try {
// //     const userId = req.user?._id;
// //     const user = await UserModel.findById(userId);
// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     const addresses = await AddressModel.find({ userId });

// //     const orders = await OrderModel.find({ userId });
// //     console.log(orders, addresses, user);
// //     res.render("user/login", {
// //       user,
// //       addresses,
// //       orders,
// //     });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // const getAccountPage = async (req, res) => {
// //   try {
// //     // const userId = req.params.userId;
// //     // console.log(userId);
// //     // const user = await UserModel.findById(userId);
// //     res.render("user/userAccountPage", { user: req.user });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// //for getting the personal information
// const getPersonalInfo = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport.user.id;
//     console.log(userId);
//     let user = null;
//     if (userId) {
//       user = await UserModel.findById(userId);
//       if (user) {
//         return res.status(200).json({
//           status: "Success",
//           message: "The user information successfully",
//           data: {
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//           },
//         });
//       }
//     }
//     res
//       .status(404)
//       .json({ status: "Failed", message: "the user is not found" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// //for updating the personal information by userId
// const updatePersonalInfo = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport.user.id;
//     const { firstName, lastName } = req.body;
//     let user = null;
//     if (userId) {
//       user = await UserModel.findByIdAndUpdate(
//         userId,
//         { firstName, lastName },
//         { new: true }
//       );

//       return res.status(200).json({
//         status: "Success",
//         message: "The user information is updated successfully",
//         data: {
//           firstName: user.firstName,
//           lastName: user.lastName,
//           email: user.email,
//         },
//       });
//     }
//     res
//       .status(404)
//       .json({ status: "Failed", message: "the user is not found" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//
// //--------------------for personal information of a corresponding user--------------------------------------//

// //for getting the address of the corresponding user
// const getAddresses = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport.user.id;
//     let addresses = [];
//     if (userId) {
//       const user = await UserModel.findById(userId);
//       if (!user) {
//         return res
//           .status(404)
//           .json({ status: "Failed", message: "the user is not found" });
//       }
//       addresses = await AddressModel.find({ userId });
//       return res.status(200).json({
//         status: "Success",
//         message: "the addresses of the user is got successfully",
//         data: addresses,
//       });
//     }
//     res
//       .status(404)
//       .json({ status: "Failed", message: "The user is not found" });
//   } catch (error) {
//     return res.status(500).json({
//       status: "error",
//       message: "Error updating user filed",
//     });
//   }
// };

//

// //for edit the existing address
// const editAddress = async (req, res) => {
//   try {
//     const addressId = req.params.id;
//     const {
//       userId,
//       firstName,
//       lastName,
//       addressLine,
//       city,
//       state,
//       pincode,
//       country,
//       phoneNo,
//       flatNo,
//     } = req.body;

//     const address = await AddressModel.findByIdAndUpdate(
//       addressId,
//       {
//         userId,
//         firstName,
//         lastName,
//         addressLine,
//         city,
//         state,
//         pincode,
//         country,
//         phoneNo,
//         flatNo,
//       },
//       { new: true }
//     );
//     if (!address) {
//       return res.status(404).json({
//         status: "error",
//         message: "Address is not found",
//       });
//     }
//     return res.status(200).json({
//       status: "success",
//       message: "address is updated successfully",
//       data: address,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: "error",
//       message: "Error updating address status",
//     });
//   }
// };

// //for deleting the existing address of the corresponding user
// const deleteAddress = async (req, res) => {
//   const userId = req.session?.user?._id || req.session?.passport.user.id;
//   const addressId = req.params.addressId;
//   const address = await AddressModel.findByIdAndDelete(addressId);

//   if (!address) {
//     return res.status(404).json({
//       status: "Failed",
//       message: "The address is not found",
//     });
//   }

//   res.status(200).json({
//     status: "Success",
//     message: "The address is deleted successfully",
//     address,
//   });
// };

// module.exports = {
//   getAccountPage,
//   getPersonalInfo,
//   updatePersonalInfo,
//   updatePersonal,
//   getAddresses,
//   getAddressDetails,
//   editAddressDetails,
//   deleteAddressDetails,
//   postAddress,
//   editAddress,
//   deleteAddress,
//   getOrderDetail,
//   cancelOrder,
//   sendReturnRequest,
// };




// shop




// //for user cart page
// const getCart = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId }) // Find cart by user ID
//       .populate({
//         path: "products.productId", // Populate the productId field in products array
//         select: "_id name images stock", // Specify which fields to include from Products
//       });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );

//     req.session.steps = [];
//     // const cartProducts = await ProductModel.find({ _id: { $in: productIds } });
//     res.render("user/cartPage", { cart, user, wishlist });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// //for add to cart the product
// const addToCart = async (req, res) => {
//   try {
//     const userId = req.session?.passport?.user?.id || req.session?.user?._id;
//     const { quantity, productId } = req.body;

//     const product = await ProductModel.findById(productId);
//     if (!product) {
//       return res
//         .status(404)
//         .json({ status: "Error", message: "Product not found!" });
//     }

//     let cart = await CartModel.findOne({ userId });
//     if (!cart) {
//       cart = new CartModel({
//         userId: userId,
//         products: [],
//         totalPrice: 0,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//     }

//     const existingProductIndex = cart.products.findIndex(
//       (p) => p.productId.toString() === productId
//     );

//     if (existingProductIndex > -1) {
//       cart.products[existingProductIndex].quantity = quantity;
//     } else {
//       cart.products.push({
//         productId: productId,
//         quantity: quantity,
//         price: product.price,
//       });
//     }

//     cart.totalPrice += product.price * quantity;
//     cart.updatedAt = Date.now();

//     await cart.save();

//     console.log("Product added to cart successfully");
//     res.status(200).json({
//       status: "Success",
//       message: "Product added to cart!",
//       cart: cart,
//     });
//   } catch (err) {
//     console.error("Error in addToCart:", err);
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const updateQuantity = async (req, res) => {
//   try {
//     const { productId, changeQuantity } = req.body;
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;

//     const cart = await CartModel.findOne({ userId });
//     if (!cart) {
//       return res
//         .status(404)
//         .json({ status: "Failed", message: "The cart is not found" });
//     }

//     const productIdx = cart.products.findIndex(
//       (p) => p.productId.toString() === productId
//     );
//     if (productIdx === -1) {
//       return res.status(404).json({
//         status: "Failed",
//         message: "The product is not found t=in the cart",
//       });
//     }

//     cart.products[productIdx].quantity += changeQuantity;

//     const total = await cart.products.reduce(
//       async (totalPromise, currProduct) => {
//         const total = await totalPromise;
//         const product = await ProductModel.findById(currProduct.productId);

//         if (!product) {
//           throw new Error(`Product with ID ${currProduct.productId} not found`);
//         }

//         return total + product.price * currProduct.quantity;
//       },
//       Promise.resolve(0)
//     );

//     cart.totalPrice = total;

//     cart.updatedAt = Date.now();
//     await cart.save();

//     return res.status(200).json({
//       status: "Success",
//       message: "The quantity is updated",
//       product: cart.products[productIdx],
//       cartTotal: cart.totalPrice,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const deleteCartProduct = async (req, res) => {
//   try {
//     const productId = req.params.id;

//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;

//     const cart = await CartModel.findOne({ userId });
//     if (!cart) {
//       return res
//         .status(404)
//         .json({ status: "Failed", message: "The cart is not found" });
//     }

//     cart.products = cart.products.filter(
//       (product) => product.productId.toString() !== productId
//     );

//     const total = await cart.products.reduce(
//       async (totalPromise, currProduct) => {
//         const total = await totalPromise;
//         const product = await ProductModel.findById(currProduct.productId);

//         if (!product) {
//           throw new Error(`Product with ID ${currProduct.productId} not found`);
//         }

//         return total + product.price * currProduct.quantity;
//       },
//       Promise.resolve(0)
//     );

//     cart.totalPrice = total;
//     cart.updatedAt = Date.now();

//     await cart.save();

//     return res.status(200).json({
//       status: "Success",
//       message: "The product is deleted fron the cart",
//       cart,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postCart = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const cart = await CartModel.findOne({ userId });
//     const cartProducts = await CartModel.aggregate([
//       {
//         $match: {
//           _id: cart._id,
//         },
//       },
//       {
//         $unwind: "$products",
//       },
//       {
//         $lookup: {
//           from: "products",
//           localField: "products.productId",
//           foreignField: "_id",
//           as: "cartProductDetails",
//         },
//       },
//       {
//         $unwind: "$cartProductDetails",
//       },
//       {
//         $project: {
//           productName: "$cartProductDetails.name",
//           productImages: "$cartProductDetails.images",
//           productId: "$cartProductDetails._id",
//           productPrice: "$cartProductDetails.price",
//           quantity: "$products.quantity",
//           productStock: "$cartProductDetails.stock",
//           totalPrice: "$totalPrice",
//         },
//       },
//     ]);
//     req.session.cartProducts = [...cartProducts];
//     if (!req.session.steps) {
//       req.session.steps = [];
//     }
//     if (!req.session.steps.includes("cart")) {
//       req.session.steps.push("cart");
//     }

//     res.redirect("/user/shop/checkout");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const getCheckout = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId }) // Find cart by user ID
//       .populate({
//         path: "products.productId", // Populate the productId field in products array
//         select: "_id name images stock", // Specify which fields to include from Products
//       });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );
//     console.log("cart = ", cart.products[0]);

//     const addresses = await AddressModel.find({ userId });

//     // const cartProducts = await ProductModel.find({ _id: { $in: productIds } });
//     res.render("user/checkoutPage", { cart, user, wishlist, addresses });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postCheckout = (req, res) => {
//   try {
//     if (!req.session.steps.includes("checkout")) {
//       req.session.steps.push("checkout");
//     }
//     res.redirect("/user/shop/delivery-address");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// // const getDeliveryAddress = async (req, res) => {
// //   try {
// //     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
// //     const user = await UserModel.findById(userId);
// //     const cart = await CartModel.findOne({ userId });
// //     const addresses = await AddressModel.find({ userId });
// //     const wishlist = await WishlistModel.findOne({ userId }).populate(
// //       "productIds",
// //       "name price images"
// //     );

// //     req.session.steps = ["cart", "checkout"];
// //     res.render("user/deliveryAddressPage", {
// //       cart,
// //       user,
// //       addresses,
// //       wishlist,
// //     });
// //   } catch (err) {
// //     res.status(500).json({ status: "Error", message: "Server Error!!!" });
// //   }
// // };

// // const postDeliveryAddress = async (req, res) => {
// //   try {
// //     const { selectedAddress } = req.body;
// //     const Address = await AddressModel.findById(selectedAddress);
// //     req.session.selectedAddress = Address;

// //     if (!req.session.steps.includes("address")) {
// //       req.session.steps.push("address");
// //     }

// //     res.redirect("/user/shop/payment");
// //   } catch (err) {
// //     res.status(500).json({ status: "Error", message: "Server Error!!!" });
// //   }
// // };

// // const getPayment = async (req, res) => {
// //   try {
// //     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
// //     const user = await UserModel.findById(userId);
// //     const cart = await CartModel.findOne({ userId });
// //     const wishlist = await WishlistModel.findOne({ userId }).populate(
// //       "productIds",
// //       "name price images"
// //     );
// //     req.session.steps = ["cart", "checkout", "address"];

// //     res.render("user/paymentMethodsPage", {
// //       cart,
// //       user,
// //       wishlist,
// //     });
// //   } catch (err) {
// //     res.status(500).json({ status: "Error", message: "Server Error!!!" });
// //   }
// // };

// // const postPayment = async (req, res) => {
// //   try {
// //     const { selectedPaymentMethod } = req.body;
// //     req.session.selectedPaymentMethod = selectedPaymentMethod;

// //     if (!req.session.steps.includes("payment")) {
// //       req.session.steps.push("payment");
// //     }
// //     res.redirect("/user/shop/summary");
// //   } catch (err) {
// //     res.status(500).json({ status: "Error", message: "Server Error!!!" });
// //   }
// // };

// const getSummary = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );
//     const address = req.session.selectedAddress;
//     const selectedPaymentMethod = req.session.selectedPaymentMethod;
//     const cartProducts = [...req.session.cartProducts];

//     req.session.steps = ["cart", "checkout", "address", "payment"];

//     res.render("user/summaryPage", {
//       cart,
//       user,
//       wishlist,
//       cartProducts,
//       address,
//       selectedPaymentMethod,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postPlaceOrder = async (req, res) => {
//   try {
//     const { _id, userId, updatedAt, createdAt, __v, ...address } =
//       req.session.selectedAddress;

//     const paymentMethod = req.session.selectedPaymentMethod;
//     const totalPrice = req.session.cartProducts[0].totalPrice;
//     const products = [...req.session.cartProducts].map((product) => {
//       return {
//         productId: product.productId,
//         quantity: product.quantity,
//         price: product.productPrice,
//       };
//     });

//     const order = new OrderModel({
//       orderId: generateOrderId(),
//       userId,
//       address,
//       products,
//       totalPrice,
//       orderStatus: "placed",
//       paymentMethod,
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//     });

//     //for inventory management like manage the stock of the corresponding products
//     for (const item of products) {
//       const product = await ProductModel.findById(item.productId);
//       if (!product) {
//         return res
//           .status(404)
//           .json({ status: "Failed", message: "The product is not found" });
//       }
//       product.stock -= item.quantity;
//       product.soldCount += 1;
//       product.save();
//     }

//     //for the cart of the corresponding user in empty
//     const cart = await CartModel.findOne({ userId });
//     if (!cart) {
//       return res
//         .status(404)
//         .json({ status: "Failed", message: "The cart is not found" });
//     }
//     cart.products = [];
//     await cart.save();

//     await order.save();

//     if (!req.session.steps.includes("summary")) {
//       req.session.steps.push("summary");
//     }
//     return res.status(200).redirect("/user/shop/place-order");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const getSuccessPage = (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;

//     // console.log(req.session);
//     req.session.cartProducts = null;
//     req.session.selectedAddress = null;
//     req.session.selectedPaymentMethod = null;
//     req.session.steps = null;

//     req.session.steps = [];
//     return res.status(200).render("user/orderSuccessPage", { orderId });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// function generateOrderId() {
//   // Fixed prefix for the order
//   const prefix = "ORD";

//   // Get the current timestamp in YYYYMMDDHHMMSS format
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
//   const day = String(now.getDate()).padStart(2, "0");
//   const hours = String(now.getHours()).padStart(2, "0");
//   const minutes = String(now.getMinutes()).padStart(2, "0");
//   const seconds = String(now.getSeconds()).padStart(2, "0");
//   const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

//   // Generate a UUID and extract the first 4 alphanumeric characters
//   const uuidSegment = uuidv4()
//     .replace(/[^a-zA-Z0-9]/g, "")
//     .substring(0, 4)
//     .toUpperCase();

//   // Combine all parts to form the order ID
//   return `${prefix}${timestamp}${uuidSegment}`;
