const express = require("express");
const router = express.Router();

const {
  getHome,
  getProductsByPages,
} = require("../../controllers/user/homeController");

router.get("/", getHome);

router.get("/api/products", getProductsByPages);

module.exports = router;
