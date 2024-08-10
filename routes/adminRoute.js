const express = require("express");

const {
  isAuthenticatedAdmin,
  redirectIfAuthenticated,
} = require("../middlewares/authenticationMiddlewares");
const {
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../middlewares/authorizationMiddlewares");

const {
  getLogin,
  postLogin,
  getDashboard,
  getLogout,
} = require("../controllers/adminController");

const router = express.Router();

const test = (req, res, next) => {
  console.log(req.url);
  next();
};

// get - /admin/login
router.get("/login", redirectIfAuthenticated, getLogin);
// post - /admin/login
router.post("/login", redirectIfAuthenticated, postLogin);

//dashboard
router.get("/dashboard", isAuthenticatedAdmin, authorizeAdmin, getDashboard);

//get - /admin/logout
router.get("/logout", isAuthenticatedAdmin, authorizeAdmin, getLogout);
module.exports = router;
