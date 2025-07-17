const HttpResponseMessage = require("../../constants/httpResponseMessage");
const HttpStatus = require("../../constants/httpStatus");
const HttpStatusCode = require("../../constants/httpStatusCode");
const CategoryModel = require("../../models/Category");
const ProductModel = require("../../models/Product");

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
    res.status(HttpStatusCode.NOT_FOUND).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
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
      return res.status(HttpStatusCode.OK).json({
        status: HttpStatus.SUCCESS,
        message: HttpResponseMessage.SUCCESS.CATEGORY_CREATION,
        data: {
          category,
        },
      });
    } else {
      return res.status(HttpStatusCode.OK).json({
        status: HttpStatus.FAILED,
        message: HttpResponseMessage.ERROR.CATEGORY_EXIST,
      });
    }
  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.CATEGORY_CREATION,
    });
  }
};

//for edit the existing category
const editCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { categoryName } = req.body;

    console.log(categoryName);
    const existingCategory = await CategoryModel.findOne({
      name: categoryName,
    });

    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        status: HttpStatus.ERROR,
        message: HttpResponseMessage.ERROR.CATEGORY_EXIST,
      });
    }

    const category = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { name: categoryName, updatedAt: Date.now() },
      { new: true }
    );

    if (!category) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.ERROR,
        message: HttpResponseMessage.ERROR.CATEGORY_NOT_FOUND,
      });
    }

    return res.status(HttpStatusCode.OK).json({
      status: HttpStatus.SUCCESS,
      message: HttpResponseMessage.ERROR.CATEGORY_UPDATE,
      data: category,
    });
  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.CATEGORY_UPDATE,
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
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.ERROR,
        message: HttpResponseMessage.ERROR.CATEGORY_NOT_FOUND,
      });
    } else {
      const products = await ProductModel.updateMany(
        { categoryId },
        { $set: { isListed } }
      );
    }

    return res.status(HttpStatusCode.OK).json({
      status: HttpStatus.SUCCESS,
      message: HttpResponseMessage.SUCCESS.CATEGORY_STATUS_UPDATE,
      data: category,
    });
  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.CATEGORY_STATUS_UPDATE,
    });
  }
};

//search categories
const searchCategories = (req, res) => {
  const query = req.query.query;
  console.log(query);
  res.redirect(`/admin/categories?query=${query}`);
};

const getAllCategoriesAPI = async (req, res) => {
  try {
    const categories = await CategoryModel.find({ isListed: true }); // Fetch all categories from the database
    res.json(categories);
  } catch (error) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: HttpResponseMessage.ERROR.CATEGORY_FETCH, error });
  }
};

module.exports = {
  getCategory,
  createCategory,
  editCategory,
  unlistCategory,
  searchCategories,
  getAllCategoriesAPI,
};
