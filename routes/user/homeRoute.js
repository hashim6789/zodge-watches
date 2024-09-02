const express = require("express");
const router = express.Router();

const { getHome } = require("../../controllers/user/homeController");

router.get("/", getHome);

module.exports = router;
