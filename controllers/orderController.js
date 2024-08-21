const Orders = require("../models/Order");
const OrderModel = require("../models/Order");

const getOrders = async (req, res) => {
  try {
    // const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    let orders = [];
    // orders = await OrderModel.find({ name: new RegExp(query, "i") })
    orders = await OrderModel.find()
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

module.exports = { getOrders };
