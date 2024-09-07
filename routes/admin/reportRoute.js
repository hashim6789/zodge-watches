const express = require("express");

const { getSalesReport } = require("../../controllers/reportController");

const router = express.Router();

router.get("/", getSalesReport);

module.exports = router;
