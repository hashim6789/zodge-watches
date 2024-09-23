const express = require("express");
const router = express.Router();

// //for Authentication
const {
  isAuthenticatedAdmin,
} = require("../../middlewares/authenticationMiddlewares");

// //for Authorization
const {
  authorizeAdmin,
  authorizeAdminForModule,
} = require("../../middlewares/authorizationMiddlewares");

// //function for category module
const {
  getCategory,
  createCategory,
  editCategory,
  unlistCategory,
  searchCategories,
  getAllCategoriesAPI,
} = require("../../controllers/admin/categoryController");

// //for testing purpose
// // const test = (req, res, next) => {
// //   console.log(req.url);
// //   next();
// // };

// //get - admin/categories/
router.get(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  getCategory
);

// //post - admin/categories/create
router.post(
  "/",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  createCategory
);

// //put - admin/categories/edit/:id
router.put(
  "/:categoryId",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  editCategory
);

// //patch - admin/categories/unlist/:id
router.patch(
  "/:categoryId/unlist",
  isAuthenticatedAdmin,
  authorizeAdmin,
  authorizeAdminForModule("categoryManagement"),
  unlistCategory
);

//an api for getting all the category
router.get("/api/get-categories", getAllCategoriesAPI);

// //get - /admin/categories/search
router.get("/search", searchCategories);

module.exports = router;
