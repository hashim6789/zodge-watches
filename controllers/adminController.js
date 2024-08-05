const UserModel = require("../models/User");
const formatDate = require("../public/assets/js/formatDate");

const admin = {
  email: "admin@gmail.com",
  password: "123456",
};

//login
const login = (req, res) => {
  if (req.method === "GET") {
    res.render("admin/login");
  }

  if (req.method === "POST") {
    const { email, password } = req.body;
    if (email === admin.email && password === admin.password) {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/admin/login");
    }
  }
};

//dashboard
const dashboard = (req, res) => {
  if (req.method === "GET") {
    // res.status(200).json({ status: "success", message: "Its, dashboard" });
    res.render("admin/demo-page");
  }
};

//users
const users = async (req, res) => {
  if (req.method === "GET") {
    const usersList = await UserModel.find();
    if (!usersList) {
      return res.status(404).json({
        status: "success",
        message: "the users are not found...",
      });
    }
    return res
      .status(200)
      .render("admin/userManagementPage", { users: usersList, formatDate });
    // return res.status(200).json({
    //   status: "Success",
    //   message: "The page rendered successfully",
    //   data: usersList,
    // });
  }
  // Update the isBlocked field for a user
  if (req.method === "PATCH") {
    try {
      const userId = req.params.id;
      const { isBlocked } = req.body;
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { isBlocked },
        { new: true } // Return the updated document
      );

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "User status updated successfully",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error updating user status",
      });
    }
  }
};

//orders
const orders = (req, res) => {
  if (req.method === "GET") {
    res.status(200).json({
      status: "Success",
      message: "The page rendered successfully",
    });
  }
};

//offers
const offers = (req, res) => {
  if (req.method === "GET") {
    res.status(200).json({
      status: "Success",
      message: "The page rendered successfully",
    });
  }
};

//coupons
const coupons = (req, res) => {
  if (req.method === "GET") {
    res.status(200).json({
      status: "Success",
      message: "The page rendered successfully",
    });
  }
};

//deals
const deals = (req, res) => {
  if (req.method === "GET") {
    res.status(200).json({
      status: "Success",
      message: "The page rendered successfully",
    });
  }
};

module.exports = {
  login,
  dashboard,
  users,
  orders,
  offers,
  coupons,
  deals,
};
