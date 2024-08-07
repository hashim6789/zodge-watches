const express = require("express");
const router = express.Router();

const {
  quickView,
  getImage,
} = require("../../controllers/user/shopController");

const test = (req, res, next) => {
  console.log(req.url);
  next();
};

//get the product details
router.get("/quickview/:productId", quickView);

//get the product image url
router.get("/getImagePath", getImage);

module.exports = router;
