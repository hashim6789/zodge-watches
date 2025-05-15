const express = require("express");
const path = require("path");
const multer = require("multer");
const router = express.Router();

// //for Authentication
const {
  isAuthenticatedAdmin,
} = require("../../middlewares/authenticationMiddlewares");

// //for Authorization
const {
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../../middlewares/authorizationMiddlewares");

// //function for banner module
const {
  getBanners,
  createBanner,
  editBanner,
  toggleBanner,
} = require("../../controllers/admin/bannerController");

// Multer configuration for banner image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/user/banners"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Validate that only one image is uploaded
const uploadBanner = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 },
}).single("bannerImage");

// //get - admin/categories/
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("bannerManagement"),
  getBanners
);

// //post - admin/categories/create
router.post(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("bannerManagement"),
  uploadBanner,
  createBanner
);

// //put - admin/categories/edit/:id
router.put(
  "/:bannerId",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("bannerManagement"),
  uploadBanner,
  editBanner
);

router.put(
  "/:bannerId/toggle",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("offerManagement"),
  toggleBanner
);

module.exports = router;
