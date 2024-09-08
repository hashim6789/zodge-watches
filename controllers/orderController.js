const OrderModel = require("../models/Order");
const WalletModel = require("../models/Wallet");
const UserModel = require("../models/User");

const getOrders = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    let orders = [];
    orders = await OrderModel.find({ orderId: new RegExp(query, "i") })
      .sort({ createdAt: -1 })
      .populate("userId", "firstName _id")
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (!orders) {
      return res.render("admin/orderManagementPage", {
        orders: null,
        current: page,
        pages: null,
      });
      //return res.status(200).json({
      //   status: "Success",
      //   message: "The page rendered successfully",
      // });
    }
    const count = await OrderModel.countDocuments({
      //   name: new RegExp(query, "i"),
    });
    res.render("admin/orderManagementPage", {
      orders,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

//for get the order details of the corresponding order by id
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await OrderModel.findById(orderId)
      .populate("userId", "firstName lastName email") // populate user details
      .populate("products.productId", "name price images"); // populate product details

    if (!order) {
      return res.status(404).json({
        status: "Failed",
        message: "The order is doesn't exist in the database",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "The order is fetched successfully",
      data: {
        order,
      },
    });

    // This mock order can now be used in your view modal testing logic.
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (updatedOrder.orderStatus === "delivered") {
      updatedOrder.paymentStatus = "successful";
      await updatedOrder.save();
    }

    res.json({ status: updatedOrder.orderStatus });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const handleReturnRequest = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { returnStatus } = req.body;

    const isReturnable = returnStatus === "approved";
    if (returnStatus === "completed") {
      // If returnStatus is 'completed', process refund
      return refundToWallet(req, res, orderId);
    }

    // Update the order with the return status
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          "returnDetails.returnStatus": returnStatus,
          "returnDetails.isReturnable": isReturnable,
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        status: "Failed",
        message: "The order is not found",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "The return request is handled successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

// Approve return request and refund to wallet
const refundToWallet = async (req, res, orderId) => {
  try {
    const order = await OrderModel.findById(orderId);

    // Check if the order is already completed or invalid
    if (!order || order.returnDetails.returnStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Invalid or already completed return",
      });
    }

    // Fetch user wallet
    let wallet = await WalletModel.findOne({ userId: order.userId });

    if (!wallet) {
      wallet = new WalletModel({
        userId: order.userId,
        balance: 0, // Initialize balance to 0
        transactions: [], // Empty transactions list
      });
    }

    // Refund the total amount to the user's wallet
    const refundAmount = order.totalPrice;
    wallet.balance += refundAmount;

    // Add a new transaction to the wallet
    wallet.transactions.push({
      type: "credit",
      amount: refundAmount,
      description: `Refund for order #${order.orderId}`,
      date: new Date(),
    });

    await wallet.save();

    // Update return status to completed
    order.returnDetails.returnStatus = "completed";
    order.orderStatus = "returned";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Return approved and amount credited to wallet",
      order,
      wallet, // Return wallet data for confirmation
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//search categories
const searchOrders = (req, res) => {
  try {
    const query = req.query.query;
    console.log(query);
    res.redirect(`/admin/orders?query=${query}`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  handleReturnRequest,
  refundToWallet,
  searchOrders,
};
