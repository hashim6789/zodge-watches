const OrderModel = require("../models/Order");

require("dotenv").config();

const admin = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  role: process.env.ADMIN_ROLE,
  permissions: process.env.ADMIN_PERMISSIONS.split(","),
};

/**---------------------------admin login------------------------ */

const getLogin = (req, res) => {
  res.render("admin/login", { err: req.query.error });
};

const postLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Set session
      req.session.admin = {
        email,
        role: "Admin",

        permissions: process.env.ADMIN_PERMISSIONS.split(","),
      };
      // console.log(req.session);
      // res
      //   .status(200)
      //   .json({ status: "success", message: "the user is login successfully" });
      res.redirect("/admin/dashboard");
    } else {
      // res
      //   .status(404)
      //   .json({ status: "failure", message: "the username or email incorrect" });
      res.redirect("/admin/login?error=Invalid email or password");
    }
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
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

    // // Fetch top selling watches
    // const topSellingWatches = await OrderModel.aggregate([
    //   { $unwind: "$items" },
    //   {
    //     $group: {
    //       _id: "$items.watch",
    //       totalSold: { $sum: "$items.quantity" },
    //     },
    //   },
    //   { $sort: { totalSold: -1 } },
    //   { $limit: 5 },
    //   {
    //     $lookup: {
    //       from: "watches",
    //       localField: "_id",
    //       foreignField: "_id",
    //       as: "watchDetails",
    //     },
    //   },
    //   { $unwind: "$watchDetails" },
    //   {
    //     $project: {
    //       name: "$watchDetails.name",
    //       totalSold: 1,
    //     },
    //   },
    // ]);

    // // Fetch customer segmentation data
    // const customerSegmentation = await OrderModel.aggregate([
    //   {
    //     $lookup: {
    //       from: "watches",
    //       localField: "items.watch",
    //       foreignField: "_id",
    //       as: "watchDetails",
    //     },
    //   },
    //   { $unwind: "$watchDetails" },
    //   {
    //     $group: {
    //       _id: "$watchDetails.category",
    //       count: { $sum: 1 },
    //     },
    //   },
    // ]);
    // Fetch top 5 best-selling products
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

    // console.log(topProducts);

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

    // console.log(topCategories);

    // res.status(200).json({ status: "success", message: "Its, dashboard" });
    res.render("admin/adminDashboard", {
      pageType: null,
      monthlySales,
      topCategories,
      topProducts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "The server Error",
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
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

module.exports = {
  getLogin,
  postLogin,
  getDashboard,
  getLogout,
};
