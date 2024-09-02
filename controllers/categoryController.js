const CategoryModel = require("../models/Category");
const ProductModel = require("../models/ProductModel");

//get all categories with pagination
const getCategory = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;

    let categories = [];
    categories = await CategoryModel.find({ name: new RegExp(query, "i") })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    if (!categories) {
      return res.render("admin/categoryManagementPage", {
        categories: null,
        current: page,
        pages: null,
      });
      //return res.status(200).json({
      //   status: "Success",
      //   message: "The page rendered successfully",
      // });
    }
    const count = await CategoryModel.countDocuments({
      name: new RegExp(query, "i"),
    });
    res.render("admin/categoryManagementPage", {
      categories,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(404).json({ status: "Success", message: "Server error!!!" });
  }
};

//for create a new category
const createCategory = async (req, res) => {
  try {
    let { categoryName } = req.body;
    categoryName = categoryName.toUpperCase();
    let category = await CategoryModel.findOne({ name: categoryName });
    console.log(category);
    if (!category) {
      category = new CategoryModel({
        name: categoryName,
        isListed: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await category.save();
      return res.status(200).json({
        status: "success",
        message: "category created successfully",
        data: {
          category,
        },
      });
    } else {
      return res.status(404).json({
        status: "Failed",
        message: "The category is already exists",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error creating the category",
    });
  }
};

//for edit the existing category
const editCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { categoryName } = req.body;

    console.log(categoryName);
    // Check if the new category name already exists
    const existingCategory = await CategoryModel.findOne({
      name: categoryName,
    });

    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res.status(400).json({
        status: "error",
        message: "Category name already exists",
      });
    }

    const category = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { name: categoryName, updatedAt: Date.now() },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "category not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "category status updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating category status",
    });
  }
};

//for unlist the existing category
const unlistCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { isListed } = req.body;

    const category = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { isListed, updatedAt: Date.now() },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "category not found",
      });
    } else {
      const products = await ProductModel.updateMany(
        { categoryId },
        { $set: { isListed } }
      );
    }

    return res.status(200).json({
      status: "success",
      message: "category status updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating category status",
    });
  }
};

//search categories
const searchCategories = (req, res) => {
  const query = req.query.query;
  console.log(query);
  res.redirect(`/admin/categories?query=${query}`);
};

module.exports = {
  getCategory,
  createCategory,
  editCategory,
  unlistCategory,
  searchCategories,
};
