const ProductModel = require("../../models/Product");
const CategoryModel = require("../../models/Category");
const HttpStatusCode = require("../../constants/httpStatusCode");
const HttpResponseMessage = require("../../constants/httpResponseMessage");
const HttpStatus = require("../../constants/httpStatus");

// for create new product creation
const createProduct = async (req, res) => {
  try {
    const { name, description, categoryId, price, stock } = req.body;
    const images = req.files.map((file) => file.filename);
    console.log(images);

    let product = await ProductModel.findOne({
      name,
    });

    if (!product) {
      const newProduct = new ProductModel({
        name,
        description,
        categoryId,
        price,
        stock,
        images: images,
      });

      await newProduct.save();

      const category = await CategoryModel.findById(newProduct._id);

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatus.SUCCESS,
        message: HttpResponseMessage.SUCCESS.PRODUCT_CREATION,
        data: { newProduct, category },
      });
    } else {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        status: HttpStatus.ERROR,
        message: HttpResponseMessage.ERROR.PRODUCT_EXIST,
      });
    }
  } catch (error) {
    // console.error("Error creating product:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: HttpResponseMessage.ERROR.PRODUCT_CREATION });
  }
};

//get all products in the products where listed
const getProducts = async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = req.query.page || 1;
    const perPage = 6;
    let products = await ProductModel.find({ name: new RegExp(query, "i") })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    let categories = await CategoryModel.find({ isListed: true });

    console.log("products", products);

    if (!products) {
      return res.render("admin/productManagementPage", {
        products: null,
        categories,
        current: page,
        pages: null,
      });
    }
    const count = await ProductModel.countDocuments({
      name: new RegExp(query, "i"),
    });
    return res.render("admin/productManagementPage", {
      products,
      categories,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

//for unlist the existing product
const unlistProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { isListed } = req.body;

    const product = await ProductModel.findByIdAndUpdate(
      productId,
      { isListed, updatedAt: Date.now() },
      { new: true }
    );

    if (!product) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        status: HttpStatus.ERROR,
        message: HttpResponseMessage.ERROR.PRODUCT_NOT_FOUND,
      });
    }

    return res.status(HttpStatusCode.OK).json({
      status: HttpStatus.SUCCESS,
      message: HttpResponseMessage.SUCCESS.PRODUCT_STATUS_UPDATE,
      data: product,
    });
  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.PRODUCT_STATUS_UPDATE,
    });
  }
};

// for update of edit the existing product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, price, stock } = req.body;
    const images = req.files ? req.files.map((file) => file.filename) : [];

    let product = await ProductModel.findById(id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.categoryId = categoryId || product.categoryId;
      product.price = price || product.price;
      product.stock = stock || product.stock;

      if (images.length > 0) {
        product.images = images;
      }

      await product.save();

      return res.status(HttpStatusCode.OK).json({
        status: HttpStatus.SUCCESS,
        message: HttpResponseMessage.SUCCESS.PRODUCT_UPDATE,
        data: product,
      });
    } else {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        status: HttpStatus.ERROR,
        message: HttpResponseMessage.ERROR.PRODUCT_NOT_FOUND,
      });
    }
  } catch (error) {
    // console.error("Error updating product:", error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: HttpResponseMessage.ERROR.PRODUCT_UPDATE });
  }
};

//for get the details about the corresponding product by id
const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res
        .status(HttpStatusCode.NOT_FOUND)
        .json({ message: HttpResponseMessage.ERROR.PRODUCT_NOT_FOUND });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: HttpResponseMessage.ERROR.SERVER_ERROR });
  }
};

//for search products by name
const searchProducts = (req, res) => {
  try {
    const query = req.query.query;
    console.log(query);
    res.redirect(`/admin/products?query=${query}`);
  } catch (err) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.ERROR,
      message: HttpResponseMessage.ERROR.SERVER_ERROR,
    });
  }
};

const getAllProductsAPI = async (req, res) => {
  try {
    const products = await ProductModel.find({ isListed: true }); // Fetch all categories from the database
    res.json(products);
  } catch (error) {
    res
      .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
      .json({ message: HttpResponseMessage.ERROR.PRODUCT_FETCH, error });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  unlistProduct,
  getProductDetails,
  searchProducts,
  getAllProductsAPI,
};
