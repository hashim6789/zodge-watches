const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/Category");

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "../uploads");
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const filename = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
//     cb(null, filename);
//   },
// });

// // Configure multer to handle the 'images[]' field
// const upload = multer({ storage }).array("images", 3); // 'images' must match the name attribute in the HTML form

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
    let products = await ProductModel.find();
    let categories = await CategoryModel.find({ isListed: true });

    if (products) {
      return res.render("admin/productManagementPage", {
        products,
        categories,
      });
      //return res.status(200).json({
      //   status: "Success",
      //   message: "The page rendered successfully",
      // });
    } else {
      return res.render("admin/productManagementPage", {
        products: null,
        categories,
      });
    }
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

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  unlistProduct,
};
