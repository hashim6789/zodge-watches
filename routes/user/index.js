const express = require("express");

const homeRouter = require("./homeRoute");
const authRouter = require("./authRoute");
// const accountRouter = require("./accountRoute");
const wishlistRouter = require("./wishlistRoute");
const cartRouter = require("./cartRoute");
const checkoutRouter = require("./checkoutRoute");
const shopRouter = require("./shopRoute");
const profileRouter = require("./profileRoute");
const walletRouter = require("./walletRoute");

const router = express.Router();
//admin modules

router.use("/", homeRouter);
router.use("/auth", authRouter);
// router.use("/account", accountRouter);
router.use("/wishlist", wishlistRouter);
router.use("/cart", cartRouter);
router.use("/checkout", checkoutRouter);
router.use("/shop", shopRouter);
router.use("/profile", profileRouter);
router.use("/wallet", walletRouter);

module.exports = router;
