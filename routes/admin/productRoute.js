const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// // Middleware to handle multiple file uploads
// const uploadFields = upload.fields([
//   { name: "productImgOne", maxCount: 1 },
//   { name: "productImgTwo", maxCount: 1 },
//   { name: "productImgThree", maxCount: 1 },
// ]);

//for testing purposes
// const test = (req, res, next) => {
//   console.log(req.url);
//   next();
// };
const {
  getAllProducts,
  createProduct,
  updateProduct,
  unlistProduct,
} = require("../../controllers/productController");

// Route to get all products
router.get("/", getAllProducts);

// Route to create product
router.post("/create", upload.array("images", 3), createProduct);

//Route to edit product
router.put("/edit/:id", upload.array("images", 3), updateProduct);

router.patch("/unlist/:id", unlistProduct);

module.exports = router;
