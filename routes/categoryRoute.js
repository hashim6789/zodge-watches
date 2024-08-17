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

//function for category module
const {
  getCategory,
  createCategory,
  editCategory,
  unlistCategory,
  searchCategories,
} = require("../controllers/categoryController");

//for testing purpose
// const test = (req, res, next) => {
//   console.log(req.url);
//   next();
// };

//get - admin/categories/
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  getCategory
);

//post - admin/categories/create
router.post(
  "/create",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  createCategory
);

//put - admin/categories/edit/:id
router.put(
  "/edit/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  editCategory
);

//patch - admin/categories/unlist/:id
router.patch(
  "/unlist/:id",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  unlistCategory
);

//get - /admin/categories/search
router.get("/search", searchCategories);

module.exports = router;
