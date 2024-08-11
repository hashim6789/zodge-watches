const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/Category");

// Handle product creation
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

      return res.status(200).json({
        status: "success",
        message: "Product created successfully",
        data: newProduct,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "The product already exists",
      });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Product creation failed" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = 6;
    let products = await ProductModel.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    let categories = await CategoryModel.find({ isListed: true });

    if (!products) {
      return res.render("admin/productManagementPage", {
        products: null,
        categories,
      });
    }
    const count = await ProductModel.countDocuments();
    return res.render("admin/productManagementPage", {
      products,
      categories,
      current: page,
      perPage,
      pages: Math.ceil(count / perPage),
    });
    //return res.status(200).json({
    //   status: "Success",
    //   message: "The page rendered successfully",
    // });
  } catch (err) {
    res.status(404).json({ status: "Success", message: "Server error!!!" });
  }
};

//for unlist the existing product
const unlistProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { isListed } = req.body;

    const product = await ProductModel.findByIdAndUpdate(
      productId,
      { isListed },
      { new: true } // Return the updated document
    );

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "product not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "product status updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error updating product status",
    });
  }
};

// Handle product update
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

      return res.status(200).json({
        status: "success",
        message: "Product updated successfully",
        data: product,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Product update failed" });
  }
};

const getDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  unlistProduct,
  getDetails,
};
