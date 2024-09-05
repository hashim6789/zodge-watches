const OrderModel = require("../models/Order");

const getOrders = async (req, res) => {
  try {
    // const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    let orders = [];
    // orders = await OrderModel.find({ name: new RegExp(query, "i") })
    orders = await OrderModel.find()
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

    res.json({ status: updatedOrder.orderStatus });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//for handle the return request of the user like approve or rejected
const handleReturnRequest = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { returnStatus } = req.body;
    console.log(returnStatus);

    const isReturnable = returnStatus === "approved";
    const orderStatus = returnStatus === "completed" ? "returned" : "delivered";

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          "returnDetails.returnStatus": returnStatus,
          "returnDetails.isReturnable": isReturnable,
          orderStatus,
          updatedAt: Date.now(),
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
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

module.exports = {
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  handleReturnRequest,
};
