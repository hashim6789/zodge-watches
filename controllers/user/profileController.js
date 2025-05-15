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
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const addresses = await AddressModel.find({ userId }).sort({
      createdAt: -1,
    });

    let orders = null;
    let totalOrders = 0;
    [orders, totalOrders] = await Promise.all([
      OrderModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("products.productId", "name images"),
      OrderModel.countDocuments({ userId }),
    ]);

    let wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      wallet = { balance: 0, transactions: [] };
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({
        userId,
        products: [],
        totalPrice: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await cart.save();
    }

    let wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );
    if (!wishlist) {
      wishlist = new WishlistModel({
        userId,
        productIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await wishlist.save();
    }

    const totalPages = Math.ceil(totalOrders / limit);

    res.render("user/myAccountPage", {
      user,
      addresses,
      orders,
      wishlist,
      cart,
      wallet,
      totalPages,
      currentPage: page,
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
    console.log(req.body);

    console.log(addressData);

    let address = await AddressModel.findOne({ email: addressData.email });
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

  if (order.orderStatus === "cancelled" && order.paymentMethod !== "cod") {
    let wallet = await WalletModel.findOne({ userId: order.userId });

    if (!wallet) {
      wallet = new WalletModel({
        userId: order.userId,
        balance: 0,
        transactions: [],
      });
    }

    const refundAmount = order.totalPrice;
    wallet.balance += refundAmount;

    wallet.transactions.push({
      type: "credit",
      amount: refundAmount,
      description: `Refund for order #${order.orderId}`,
      date: new Date(),
    });

    await wallet.save();
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

    let trackingSteps = [];
    if (order.orderStatus === "placed") {
      trackingSteps = ["placed"];
    } else if (order.orderStatus === "shipped") {
      trackingSteps = ["placed", "shipped"];
    } else if (order.orderStatus === "delivered") {
      trackingSteps = ["placed", "shipped", "delivered"];
    }

    res.status(200).render("user/orderDetailsPage", {
      cart,
      order,
      user,
      trackingSteps,
      wishlist,
    });
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

const getOrdersList = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 3;
  const skip = (page - 1) * limit;

  try {
    const orders = await OrderModel.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("products.productId", "name images")
      .exec();
    const totalOrders = await OrderModel.countDocuments({
      userId: req.user._id,
    });

    console.log(totalOrders);
    res.json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
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
  getOrdersList,
};
