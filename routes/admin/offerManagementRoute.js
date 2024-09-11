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
  updateOffer,
  toggleOffer,
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

router.put(
  "/:offerId",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("offerManagement"),
  updateOffer
);

router.put(
  "/:offerId/toggle",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("offerManagement"),
  toggleOffer
);

module.exports = router;
