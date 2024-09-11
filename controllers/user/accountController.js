const AddressModel = require("../../models/Address");
const UserModel = require("../../models/User");
const OrderModel = require("../../models/Order");

//get the account profile page
// const getAccount = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const addresses = await AddressModel.find({ userId });

//     const orders = await OrderModel.find({ userId });
//     console.log(orders, addresses, user);
//     res.render("user/login", {
//       user,
//       addresses,
//       orders,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getAccountPage = async (req, res) => {
//   try {
//     // const userId = req.params.userId;
//     // console.log(userId);
//     // const user = await UserModel.findById(userId);
//     res.render("user/userAccountPage", { user: req.user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//--------------------for personal information of a corresponding user--------------------------------------//

//for getting the personal information
const getPersonalInfo = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport.user.id;
    console.log(userId);
    let user = null;
    if (userId) {
      user = await UserModel.findById(userId);
      if (user) {
        return res.status(200).json({
          status: "Success",
          message: "The user information successfully",
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        });
      }
    }
    res
      .status(404)
      .json({ status: "Failed", message: "the user is not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//for updating the personal information by userId
const updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport.user.id;
    const { firstName, lastName } = req.body;
    let user = null;
    if (userId) {
      user = await UserModel.findByIdAndUpdate(
        userId,
        { firstName, lastName },
        { new: true }
      );

      return res.status(200).json({
        status: "Success",
        message: "The user information is updated successfully",
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    }
    res
      .status(404)
      .json({ status: "Failed", message: "the user is not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//update the personal details
const updatePersonal = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "user not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "user updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating user filed",
    });
  }
};
//--------------------for personal information of a corresponding user--------------------------------------//

//for getting the address of the corresponding user
const getAddresses = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport.user.id;
    let addresses = [];
    if (userId) {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: "Failed", message: "the user is not found" });
      }
      addresses = await AddressModel.find({ userId });
      return res.status(200).json({
        status: "Success",
        message: "the addresses of the user is got successfully",
        data: addresses,
      });
    }
    res
      .status(404)
      .json({ status: "Failed", message: "The user is not found" });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating user filed",
    });
  }
};

//get an address details
const getAddressDetails = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const userId = req.session?.user?._id || req.session?.passport.user.id;
    let user = null;
    if (userId) {
      user = await UserModel.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: "Failed", message: "the user is not found" });
      }

      const address = await AddressModel.findById(addressId);
      if (!address) {
        return res
          .status(404)
          .json({ status: "Failed", message: "the address is not found" });
      }
      return res.status(200).json({
        status: "Success",
        message: "the addresses of the user is got successfully",
        data: address,
      });
    }
    res
      .status(404)
      .json({ status: "Failed", message: "The user is not found" });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating user filed",
    });
  }
};

//for edit an address
const editAddressDetails = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const updateValues = req.body;
    const userId = req.session?.user?._id || req.session?.passport.user.id;
    let user = null;
    if (userId) {
      user = await UserModel.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: "Failed", message: "the user is not found" });
      }
      const address = await AddressModel.findByIdAndUpdate(
        addressId,
        { userId, ...updateValues },
        { new: true }
      );
      if (!address) {
        return res.status(404).json({
          status: "Failed",
          message: "The address is not found",
          data: address,
        });
      }
      return res.status(200).json({
        status: "Success",
        message: "the addresses of the user is got successfully",
        data: address,
      });
    }
    res
      .status(404)
      .json({ status: "Failed", message: "The user is not found" });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating user filed",
    });
  }
};

//for deleting the existing address by id
const deleteAddressDetails = async (req, res) => {
  try {
    addressId = req.params.addressId;
    const userId = req.session?.user?._id || req.session?.passport.user.id;
    let user = null;
    if (userId) {
      user = await UserModel.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: "Failed", message: "the user is not found" });
      }
      const deletedAddress = await AddressModel.findByIdAndDelete(addressId);
      if (!deletedAddress) {
        return res.status(404).json({
          status: "Failed",
          message: "The address is not found",
        });
      }
      return res.status(200).json({
        status: "Success",
        message: "the addresses of the user is got successfully",
        data: deletedAddress,
      });
    }
    res
      .status(404)
      .json({ status: "Failed", message: "The user is not found" });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
};

//create the new address
const postAddress = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      secondName,
      phoneNo,
      email,
      addressLine,
      pincode,
      state,
      country,
      city,
      flatNo,
    } = req.body;

    // console.log(req.body);

    let address = await AddressModel.findOne({ email });
    if (!address) {
      address = new AddressModel({
        userId,
        firstName,
        lastName: secondName,
        phoneNo,
        email,
        addressLine,
        pincode,
        state,
        country,
        city,
        flatNo,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const savedAddress = await address.save();
      return res.status(201).json({
        status: "success",
        message: "user updated successfully",
        data: savedAddress,
      });
    } else {
      res.status(404).json({
        status: "Failed",
        message: "the Address is already exist!!!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error creating the address",
    });
  }
};

//for edit the existing address
const editAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      userId,
      firstName,
      lastName,
      addressLine,
      city,
      state,
      pincode,
      country,
      phoneNo,
      flatNo,
    } = req.body;

    const address = await AddressModel.findByIdAndUpdate(
      addressId,
      {
        userId,
        firstName,
        lastName,
        addressLine,
        city,
        state,
        pincode,
        country,
        phoneNo,
        flatNo,
      },
      { new: true }
    );
    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "Address is not found",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "address is updated successfully",
      data: address,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error updating address status",
    });
  }
};

//for deleting the existing address of the corresponding user
const deleteAddress = async (req, res) => {
  const userId = req.session?.user?._id || req.session?.passport.user.id;
  const addressId = req.params.addressId;
  const address = await AddressModel.findByIdAndDelete(addressId);

  if (!address) {
    return res.status(404).json({
      status: "Failed",
      message: "The address is not found",
    });
  }

  res.status(200).json({
    status: "Success",
    message: "The address is deleted successfully",
    address,
  });
};

const getOrderDetail = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport.user.id;
    const orderId = req.params.orderId;
    const user = await UserModel.findById(userId);
    const order = await OrderModel.findById(orderId).populate(
      "products.productId",
      "_id name images"
    );
    console.log("order = ", order);
    if (!order) {
      return res.status(404).json({
        status: "Failed",
        message: "The order is not found",
      });
    }

    res
      .status(200)
      .render("user/orderDetailsPage", { order, user, wishlist: {} });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error updating address status",
    });
  }
};

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
      .json({ status: "Failed", message: "The order is not found!!!" });
  }

  res.status(200).json({
    status: "Success",
    message: "the order is cancelled successfully...",
    order,
  });
};

//for sending the return request to admin
const sendReturnRequest = async (req, res) => {
  const { orderId, returnReason } = req.body;
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
  if (!order) {
    return res
      .status(404)
      .json({ status: "Failed", message: "The order is not found!!!" });
  }

  res.status(200).json({
    status: "Success",
    message: "the user send the return request to the user successfully...",
    order,
  });
};

module.exports = {
  // getAccountPage,
  getPersonalInfo,
  updatePersonalInfo,
  updatePersonal,
  getAddresses,
  getAddressDetails,
  editAddressDetails,
  deleteAddressDetails,
  postAddress,
  editAddress,
  deleteAddress,
  getOrderDetail,
  cancelOrder,
  sendReturnRequest,
};
