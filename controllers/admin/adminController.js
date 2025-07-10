const { ENV } = require("../../config/env.config");
const HttpResponseMessage = require("../../constants/httpResponseMessage");
const HttpStatus = require("../../constants/httpStatus");
const HttpStatusCode = require("../../constants/httpStatusCode");
const OrderModel = require("../../models/Order");

require("dotenv").config();

const admin = {
  email: ENV.ADMIN_EMAIL,
  password: ENV.ADMIN_PASSWORD,
  role: ENV.ADMIN_ROLE,
  permissions: ENV.ADMIN_PERMISSIONS.split(","),
};

/**---------------------------admin login------------------------ */

const getLogin = (req, res) => {
  res.render("admin/login", { err: req.query.error });
};

const postLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (email === ENV.ADMIN_EMAIL && password === ENV.ADMIN_PASSWORD) {
      // Set session
      req.session.admin = {
        email,
        role: "Admin",

        permissions: ENV.ADMIN_PERMISSIONS.split(","),
      };
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/admin/login?error=Invalid email or password");
    }
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

//dashboard
const getDashboard = async (req, res) => {
  try {
    const monthlySales = await OrderModel.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log(monthlySales);

    const topProducts = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSales: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          name: "$productDetails.name",
          image: { $arrayElemAt: ["$productDetails.images", 0] },
          sales: "$totalSales",
        },
      },
    ]);

    // Fetch top 10 best-selling categories
    const topCategories = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.categoryId",
          totalSales: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          name: "$categoryDetails.name",
          image: "$categoryDetails.image",
          sales: "$totalSales",
        },
      },
    ]);

    res.render("admin/adminDashboard", {
      pageType: null,
      monthlySales,
      topCategories,
      topProducts,
    });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

//for logout
const getLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("logout error:", err);
        return res.redirect("/admin/dashboard");
      }
      console.log(req.session);
      res.clearCookie("connect-cookie");
      res.redirect("/admin/login");
    });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.ERROR.SERVER_ERROR,
    });
  }
};

module.exports = {
  getLogin,
  postLogin,
  getDashboard,
  getLogout,
};
