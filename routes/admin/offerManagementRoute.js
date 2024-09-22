const express = require("express");

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
} = require("../../controllers/offerController");

const router = express.Router();

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
  createOffer
);

// // Route for editing an existing offer
router.patch("/:offerId", editOffer);

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

// // router.put(
// //   "/:offerId",
// //   // isAuthenticatedAdmin,
// //   // authorizeAdmin,
// //   // authorizeAdminForModule("offerManagement"),
// //   updateOffer
// // );
// // router.get("/:offerId", getOffer);
