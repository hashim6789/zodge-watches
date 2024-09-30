const express = require("express");
const multer = require("multer");
const path = require("path");

// //for Authentication
const {
  isAuthenticatedAdmin,
} = require("../../middlewares/authenticationMiddlewares");

// //for Authorization
const {
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../../middlewares/authorizationMiddlewares");

const {
  getOffers,
  createOffer,
  editOffer,
  getApplicableItems,
  toggleOffer,
  fetchOffer,
} = require("../../controllers/admin/offerController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/user/offers"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Validate that only one image is uploaded
const uploadOffer = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 },
}).single("offerImage");
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("offerManagement"),
  getOffers
);

router.post(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("offerManagement"),
  uploadOffer,
  createOffer
);

// // Route for editing an existing offer
router.patch("/:offerId", uploadOffer, editOffer);

router.put(
  "/:offerId/toggle",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("offerManagement"),
  toggleOffer
);

router.get(
  "/api/offers/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("offerManagement"),
  fetchOffer
);

// // Route for fetching applicable items based on the applicable type
router.get(
  "/api/applicable-items",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("offerManagement"),
  getApplicableItems
);

module.exports = router;
