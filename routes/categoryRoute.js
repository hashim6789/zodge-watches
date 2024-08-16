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

const {
  getCategory,
  createCategory,
  editCategory,
  unlistCategory,
  searchCategories,
} = require("../controllers/categoryController");

//for testing purpose
const test = (req, res, next) => {
  console.log(req.url);
  next();
};

//get - admin/categories/
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  getCategory
);

//post - admin/categories/
router.post(
  "/create",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  createCategory
);

//put - admin/categories/
router.put(
  "/edit/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  editCategory
);

//patch - admin/categories/
router.patch(
  "/unlist/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  unlistCategory
);

//get - /admin/categories/search
router.get("/search", test, searchCategories);

module.exports = router;
