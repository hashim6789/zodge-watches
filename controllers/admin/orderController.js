const HttpResponseMessage = require("../../constants/httpResponseMessage");
const HttpStatus = require("../../constants/httpStatus");
const HttpStatusCode = require("../../constants/httpStatusCode");
const OrderModel = require("../../models/Order");
const WalletModel = require("../../models/Wallet");
// const UserModel = require("../../models/User");
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
    }
    const count = await OrderModel.countDocuments({});
    res.render("admin/orderManagementPage", {
      orders,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

//for get the order details of the corresponding order by id
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await OrderModel.findById(orderId)
      .populate("userId", "firstName lastName email")
      .populate("products.productId", "name price images");

    console.log(order);

    if (!order) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.ORDER_NOT_FOUND,
      });
    }

    res.status(HttpStatusCode.OK).json({
      status: HttpStatus.SUCCESS,
      message: HttpResponseMessage.SUCCESS.ORDER_FETCH,
      data: {
        order,
      },
    });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
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
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: HttpResponseMessage.ERROR.ORDER_NOT_FOUND });
    }

    if (updatedOrder.orderStatus === "delivered") {
      updatedOrder.paymentStatus = "successful";
      await updatedOrder.save();
    }

    if (
      updatedOrder.orderStatus === "cancelled" &&
      updatedOrder.paymentMethod !== "cod"
    ) {
      let wallet = await WalletModel.findOne({ userId: updatedOrder.userId });

      if (!wallet) {
        wallet = new WalletModel({
          userId: updatedOrder.userId,
          balance: 0,
          transactions: [],
        });
      }

      const refundAmount = updatedOrder.totalPrice;
      wallet.balance += refundAmount;

      wallet.transactions.push({
        type: "credit",
        amount: refundAmount,
        description: `Refund for order #${updatedOrder.orderId}`,
        date: new Date(),
      });

      await wallet.save();
    }

    res.json({ status: updatedOrder.orderStatus });
  } catch (error) {
    // console.error("Error updating order status:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: HttpResponseMessage.ERROR.SERVER_ERROR });
  }
};

const handleReturnRequest = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { returnStatus } = req.body;

    const isReturnable = returnStatus === "approved";
    if (returnStatus === "completed") {
      return refundToWallet(req, res, orderId);
    }

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
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.ORDER_NOT_FOUND,
      });
    }

    res.status(HttpStatusCode.OK).json({
      status: HttpStatus.SUCCESS,
      message: HttpResponseMessage.SUCCESS.ORDER_RETURN_REQUEST,
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

// Approve return request and refund to wallet
const refundToWallet = async (req, res, orderId) => {
  try {
    const order = await OrderModel.findById(orderId);

    if (!order || order.returnDetails.returnStatus === "completed") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: HttpResponseMessage.ERROR.ORDER_RETURN_COMPLETED,
      });
    }

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

    order.returnDetails.returnStatus = "completed";
    order.orderStatus = "returned";
    await order.save();

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: HttpResponseMessage.SUCCESS.ORDER_RETURN_APPROVED,
      order,
      wallet,
    });
  } catch (err) {
    console.error(err);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
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
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
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
