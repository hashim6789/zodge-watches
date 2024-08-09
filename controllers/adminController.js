const passport = require("passport");
const UserModel = require("../models/User");
const formatDate = require("../public/assets/js/formatDate");

require("dotenv").config();

const admin = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD, // In real applications, ensure to hash the password
  role: process.env.ADMIN_ROLE,
  permissions: process.env.ADMIN_PERMISSIONS.split(","),
};

//login
const getLogin = (req, res) => {
  res.render("admin/login", { err: req.query.error });
};

const postLogin = (req, res, next) => {
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
};

//dashboard
const getDashboard = (req, res) => {
  // res.status(200).json({ status: "success", message: "Its, dashboard" });
  res.render("admin/demo-page");
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
  getLogin,
  postLogin,
  getDashboard,
  users,
  orders,
  offers,
  coupons,
  deals,
};
