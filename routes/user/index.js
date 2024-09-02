const express = require("express");

const homeRouter = require("./homeRoute");
const authRouter = require("./authRoute");
const accountRouter = require("./accountRoute");
// const shopRouter = require("./shopRoute");

const router = express.Router();
//admin modules

router.use("/", homeRouter);
router.use("/auth", authRouter);
router.use("/account", accountRouter);
// router.use("/shopRoute", shopRouter)

module.exports = router;
