const express = require("express");

//for authentication
const {
  isAuthenticatedAdmin,
  redirectIfAuthenticated,
} = require("../../middlewares/authenticationMiddlewares");

//for authorization
const {
  authorizeAdmin,
} = require("../../middlewares/authorizationMiddlewares");
//functions for admin module
const {
  getLogin,
  postLogin,
  getDashboard,
  getLogout,
} = require("../../controllers/admin/adminController");

const router = express.Router();

// get - /admin/login
router.get("/login", redirectIfAuthenticated, getLogin);
// post - /admin/login
router.post("/login", redirectIfAuthenticated, postLogin);

//dashboard
router.get("/dashboard", isAuthenticatedAdmin, authorizeAdmin, getDashboard);

//get - /admin/logout
router.get("/logout", isAuthenticatedAdmin, authorizeAdmin, getLogout);
module.exports = router;
