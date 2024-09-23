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
  toggleBanner, // searc,
  // getAllBannersAPI,
} = require("../../controllers/admin/bannerController");

// //for testing purpose
// // const test = (req, res, next) => {
// //   console.log(req.url);
// //   next();
// // };

// Multer configuration for banner image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/user/banners")); // Path for banner uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Add timestamp to avoid duplicate filenames
  },
});

// Validate that only one image is uploaded
const uploadBanner = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // Limit file size to 2MB
}).single("bannerImage"); // Accept only one file with the field name 'bannerImage'

// Middleware to check if an image is uploaded
// const validateBannerUpload = (req, res, next) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "Please upload an image." });
//   }
//   next();
// };
// //get - admin/categories/
router.get(
  "/",
  //   isAuthenticatedAdmin,
  //   authorizeAdmin,
  //   authorizeAdminForModule("bannerManagement"),
  getBanners
);

// //post - admin/categories/create
router.post(
  "/",
  //   isAuthenticatedAdmin,
  //   authorizeAdmin,
  //   authorizeAdminForModule('bannerManagement'),
  uploadBanner,
  //   validateBannerUpload,
  createBanner
);

// //put - admin/categories/edit/:id
router.put(
  "/:bannerId",
  //   isAuthenticatedAdmin,
  //   authorizeAdmin,
  //   authorizeAdminForModule("bannerManagement"),

  uploadBanner, // Handle the file upload
  //   validateBannerUpload, // Ensure the file was uploaded
  editBanner
);

// // //patch - admin/categories/unlist/:id

router.put(
  "/:bannerId/toggle",
  //   isAuthenticatedAdmin,
  //   authorizeAdmin,
  //   authorizeAdminForModule("offerManagement"),
  toggleBanner
);

// //an api for getting all the banner
// router.get("/api/get-categories", getAllBannersAPI);

// // //get - /admin/categories/search
// router.get("/search", searchBanners);

module.exports = router;
