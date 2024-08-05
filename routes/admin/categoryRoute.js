const express = require("express");

//for testing purpose
// const test = (req, res, next) => {
//   console.log(req.url);
//   next();
// };
const {
  getCategory,
  createCategory,
  editCategory,
  unlistCategory,
} = require("../../controllers/categoryController");

const router = express.Router();

//get - admin/categories/
router.get("/", getCategory);

//post - admin/categories/
router.post("/create", createCategory);

//put - admin/categories/
router.put("/edit/:id", editCategory);

//patch - admin/categories/
router.patch("/unlist/:id", unlistCategory);

module.exports = router;
