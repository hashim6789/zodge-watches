const express = require("express");

const authRouter = require("./authRoute");
const reportRouter = require("./reportRoute");
const userManagementRouter = require("./userManagementRoute");
const orderManagementRouter = require("./orderManagementRoute");
const categoryManagementRouter = require("./categoryManagementRoute");
const productManagementRoute = require("./productManagementRoute");
const offerManagementRouter = require("./offerManagementRoute");
const couponManagementRouter = require("./couponManagementRoute");
const bannerManagementRouter = require("./bannerManagementRoute");

const router = express.Router();
//admin modules

router.use("/", authRouter);
router.use("/reports", reportRouter);
router.use("/users", userManagementRouter);
router.use("/orders", orderManagementRouter);
router.use("/categories", categoryManagementRouter);
router.use("/products", productManagementRoute);
router.use("/offers", offerManagementRouter);
router.use("/coupons", couponManagementRouter);
router.use("/banners", bannerManagementRouter);

module.exports = router;
