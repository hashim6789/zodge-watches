const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

//for Authentication
const {
  isAuthenticatedAdmin,
} = require("../middlewares/authenticationMiddlewares");

//for Authorization
const {
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../middlewares/authorizationMiddlewares");

//for product functions
const {
  getAllProducts,
  createProduct,
  updateProduct,
  unlistProduct,
  getDetails,
} = require("../controllers/productController");

//for uploading the images of the products
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

//validate the image count at least 3
const validateImageCount = (req, res, next) => {
  if (req.files.length < 3) {
    return res
      .status(400)
      .json({ message: "Please upload at least 3 images." });
  }
  next();
};

// get - /admin/products
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("productManagement"),
  getAllProducts
);

// post - /admin/products/create
router.post(
  "/create",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("productManagement"),
  upload.array("images", 10),
  validateImageCount,
  createProduct
);

//put - /admin/products/edit/:id
router.put(
  "/edit/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("productManagement"),
  upload.array("images", 3),
  updateProduct
);

//patch - /admin/products/unlist/:id
router.patch(
  "/unlist/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("productManagement"),
  unlistProduct
);

//get - /admin/products/details/:id
router.get(
  "/details/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("productManagement"),
  getDetails
);

module.exports = router;
