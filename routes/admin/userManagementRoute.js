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

// //functions for users module
const {
  getUsers,
  blockUser,
  searchUsers,
} = require("../../controllers/userController");

const router = express.Router();

// //get - /admin/users/
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("userManagement"),
  getUsers
);

// //get - /admin/users/block/:id
router.patch(
  "/:userId/block",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("userManagement"),
  blockUser
);

// //get - /admin/users/search
router.get("/search", searchUsers);

module.exports = router;
