const express = require("express");

const {
  getOffers,
  createOffer,
  updateOffer,
  toggleOffer,
} = require("../../controllers/offerController");

const router = express.Router();

router.get("/", getOffers);

router.post("/", createOffer);

router.put("/:offerId", updateOffer);

router.put("/:offerId/toggle", toggleOffer);

module.exports = router;
