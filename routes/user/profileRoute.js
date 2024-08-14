const express = require("express");

const {
  getProfile,
  updatePersonal,
  postAddress,
  editAddress,
} = require("../../controllers/user/profileController");

const router = express();

const test = (req, res, next) => {
  console.log(req.url);
  next();
};

//get - /user/profile
router.get("/:id", getProfile);

//patch - /user/profile/personal/:id
router.patch("/personal/:id", updatePersonal);

//post - /user/profile/address
router.post("/address", postAddress);

//put - /user/profile/address
router.put("/address/:id", editAddress);

module.exports = router;
