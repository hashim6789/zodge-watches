const express = require("express");

const {
  isAuthenticatedAdmin,
  isAuthenticatedUser,
  redirectIfAuthenticated,
} = require("../middlewares/authMiddlewares");
const {
  authorizeUser,
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../middlewares/authorizationMiddlewares");

const {
  getLogin,
  postLogin,
  getDashboard,
  users,
  orders,
  offers,
  coupons,
  deals,
} = require("../controllers/adminController");

const router = express.Router();

const test = (req, res, next) => {
  console.log(req.url);
  next();
};

// // User login with traditional method
// app.post('/login', passport.authenticate('user-local', {
//   successRedirect: '/home',
//   failureRedirect: '/login',
//   failureFlash: true
// }));

// Admin login with traditional method

// get - /admin/login
router.get("/login", redirectIfAuthenticated, getLogin);
// post - /admin/login
router.post("/login", redirectIfAuthenticated, postLogin);

//dashboard
router.get("/dashboard", isAuthenticatedAdmin, authorizeAdmin, getDashboard);

//users
router.get("/users", users);
router.patch("/users/block/:id", users);

//orders
router.get("/orders", orders);

//offers
router.get("/offers", offers);

//coupons
router.get("/coupons", coupons);

//deals
router.get("/deals", deals);

module.exports = router;
