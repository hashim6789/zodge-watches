const express = require("express");
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

//user functions
const { getUsers, blockUser } = require("../controllers/userController");

//get - /admin/users/
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("userManagement"),
  getUsers
);

//get - /admin/users/block/:id
router.patch(
  "/block/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("userManagement"),
  blockUser
);

module.exports = router;
