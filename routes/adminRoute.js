const express = require("express");

const {
  login,
  dashboard,
  users,
  orders,
  offers,
  coupons,
  deals,
} = require("../controllers/adminController");

const router = express.Router();

//login
router.get("/login", login);
router.post("/login", login);

//dashboard
router.get("/dashboard", dashboard);

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
