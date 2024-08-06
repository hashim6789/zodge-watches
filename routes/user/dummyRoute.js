const express = require("express");
const router = express.Router();

const { dummy } = require("../../controllers/user/dummyController");

router.get("/", dummy);

module.exports = router;
