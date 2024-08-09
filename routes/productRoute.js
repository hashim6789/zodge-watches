const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  updateProduct,
  unlistProduct,
  getDetails,
} = require("../controllers/productController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
// for testing purposes
const test = (req, res, next) => {
  console.log(req.url);
  next();
};

const validateImageCount = (req, res, next) => {
  if (req.files.length < 3) {
    return res
      .status(400)
      .json({ message: "Please upload at least 3 images." });
  }
  next();
};

// Route to get all products
router.get("/", getAllProducts);

// Route to create product
router.post(
  "/create",
  test,
  upload.array("images", 10),
  validateImageCount,
  createProduct
);

//Route to edit product
router.put("/edit/:id", upload.array("images", 3), updateProduct);

router.patch("/unlist/:id", unlistProduct);

router.get("/details/:id", getDetails);

module.exports = router;
