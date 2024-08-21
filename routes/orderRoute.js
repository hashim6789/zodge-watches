const express = require("express");
const router = express.Router();

//for Authentication
const {
  isAuthenticatedAdmin,
} = require("../middlewares/authenticationMiddlewares");

//for Authorization
const {
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../middlewares/authorizationMiddlewares");

//function for category module
const { getOrders } = require("../controllers/orderController");

//for testing purpose
// const test = (req, res, next) => {
//   console.log(req.url);
//   next();
// };

//get - /admin/orders/
router.get("/", getOrders);

module.exports = router;
