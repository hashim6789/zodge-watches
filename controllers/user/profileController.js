const AddressModel = require("../../models/Address");
const UserModel = require("../../models/User");
const OrderModel = require("../../models/Order");
const WishlistModel = require("../../models/Wishlist");
const CartModel = require("../../models/Cart");
const WalletModel = require("../../models/Wallet");

//get the account profile page
const getAccountPage = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const addresses = await AddressModel.find({ userId }).sort({
      createdAt: -1,
    });

    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    let wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      wallet = { balance: 0, transactions: [] };
    }
    res.render("user/userAccountPage", {
      user,
      addresses,
      orders,
      wallet,
      msg: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// //--------------------for personal information of a corresponding user--------------------------------------//

//update the personal details
const updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { firstName, lastName } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true }
    );

    console.log(userId, firstName, lastName, user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "user updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user filed",
    });
  }
};

// //--------------------for addresses management of a corresponding user--------------------------------------//

// //create the new address
const createAddress = async (req, res) => {
  try {
    const addressData = req.body;
    const email = addressData.email;

    console.log(addressData);

    let address = await AddressModel.findOne({ email });
    if (!address) {
      address = new AddressModel(addressData);
      console.log(address);

      const savedAddress = await address.save();
      return res.status(201).json({
        success: true,
        message: "user updated successfully",
        data: savedAddress,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "the Address is already exist!!!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating the address",
    });
  }
};

// //for edit an address
const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const addressDate = req.body;
    // const userId = req.session?.user?._id || req.session?.passport.user.id;
    // let user = null;
    // if (userId) {
    //   user = await UserModel.findById(userId);
    //   if (!user) {
    //     return res
    //       .status(404)
    //       .json({ status: "Failed", message: "the user is not found" });
    //   }
    const address = await AddressModel.findByIdAndUpdate(
      addressId,
      addressDate,
      { new: true }
    );
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "The address is not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "the addresses of the user is got successfully",
      address,
    });
    // }
    // res
    //   .status(404)
    //   .json({ status: "Failed", message: "The user is not found" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user filed",
    });
  }
};

//for deleting the existing address by id
const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    // const userId = req.session?.user?._id || req.session?.passport.user.id;
    // let user = null;
    // if (userId) {
    //   user = await UserModel.findById(userId);
    //   if (!user) {
    //     return res
    //       .status(404)
    //       .json({ status: "Failed", message: "the user is not found" });
    //   }
    const deletedAddress = await AddressModel.findByIdAndDelete(addressId);
    if (!deletedAddress) {
      return res.status(404).json({
        success: false,
        message: "The address is not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "the addresses of the user is got successfully",
      deletedAddress,
    });
    // }
    // res
    //   .status(404)
    //   .json({ status: "Failed", message: "The user is not found" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// //--------------------for orders management of a corresponding user--------------------------------------//

//for cancelling the corresponding user;
const cancelOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const order = await OrderModel.findByIdAndUpdate(
    orderId,
    { orderStatus: "cancelled" },
    { new: true }
  );
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "The order is not found!!!" });
  }

  res.status(200).json({
    success: true,
    message: "the order is cancelled successfully...",
    order,
  });
};

//view the order details page
const viewOrderDetail = async (req, res) => {
  try {
    const userId = req.user?._id;
    const orderId = req.params.orderId;
    wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );
    const cart = await CartModel.findOne({ userId });

    const user = await UserModel.findById(userId);
    const order = await OrderModel.findById(orderId).populate(
      "products.productId",
      "_id name images"
    );
    console.log("order = ", wishlist);
    if (!order) {
      return res.status(404).json({
        status: "Failed",
        message: "The order is not found",
      });
    }

    res
      .status(200)
      .render("user/orderDetailsPage", { cart, order, user, wishlist });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error updating address status",
    });
  }
};

// //for sending the return request to admin
const sendReturnRequest = async (req, res) => {
  const orderId = req.params.orderId;
  const { returnReason } = req.body;
  console.log(orderId, returnReason);
  const order = await OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        "returnDetails.returnStatus": "requested",
        "returnDetails.returnReason": returnReason,
        "returnDetails.returnRequestedAt": Date.now(),
      },
    },
    { new: true }
  );
  console.log(order);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "The order is not found!!!" });
  }

  res.status(200).json({
    success: true,
    message: "the user send the return request to the user successfully...",
    order,
  });
};

module.exports = {
  getAccountPage,
  updatePersonalInfo,
  createAddress,
  updateAddress,
  deleteAddress,
  cancelOrder,
  viewOrderDetail,
  sendReturnRequest,
};

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
