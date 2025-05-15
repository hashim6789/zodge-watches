const express = require("express");
const router = express.Router();

const {
  getProductDetails,
  getImage,
  getShop,
} = require("../../controllers/user/shopController");

router.get("/", getShop);

//get - /shop/product/:id
router.get("/products/:productId", getProductDetails);

//get - /shop/getImagePath
router.get("/getImagePath", getImage);

module.exports = router;
