const express = require("express");

const homeRouter = require("./homeRoute");
const authRouter = require("./authRoute");
const accountRouter = require("./accountRoute");
const cartRouter = require("./cartRoute");
const checkoutRouter = require("./checkoutRoute");
const shopRouter = require("./shopRoute");

const router = express.Router();
//admin modules

router.use("/", homeRouter);
router.use("/auth", authRouter);
router.use("/account", accountRouter);
router.use("/cart", cartRouter);
router.use("/checkout", checkoutRouter);
router.use("/shop", shopRouter);

module.exports = router;
