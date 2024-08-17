const ProductModel = require("../../models/ProductModel"); // Adjust the path as needed
const CategoryModel = require("../../models/Category");

//for rendering the quick view (Product details page);
const quickView = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    res.render("user/quickview", { product, ratings: 4 });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server error");
  }
};

//for get the images of the corresponding products
const getImage = async (req, res) => {
  try {
    const index = parseInt(req.query.index, 10);
    const productId = req.query.id;

    const product = await ProductModel.findById(productId);
    if (product) {
      if (isNaN(index) || index < 0 || index >= product.images.length) {
        return res.status(400).json({ error: "Invalid index" });
      }
      return res
        .status(200)
        .json({ src: `/public/uploads/${product.images[index]}` });
    } else {
      return res.status(404).json({
        status: "Failed",
        message: "The product doesn't exist",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "Server error!!!",
    });
  }
};

//for filtering the products by categories
const filterCategoryProduct = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await CategoryModel.findById(categoryId);
    if (category) {
      const products = await ProductModel.find({ categoryId, isListed: true });
      console.log("testing");

      res.status(200).json({
        status: "Success",
        message: "The products successfully fetched...",
        data: products,
      });
    } else {
      res.status(404).json({
        status: "Failure",
        message: " The category doesn't exists",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error!!!",
    });
  }
};

//for get the products of all without filtering the categories
const filterAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ isListed: true });
    if (products.length > 0) {
      res.status(200).json({
        status: "Success",
        message: "The products successfully fetched...",
        data: products,
      });
    } else {
      res.status(404).json({
        status: "Failure",
        message: " The products exists",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error!!!",
    });
  }
};

//search products
const searchProducts = async (req, res) => {
  try {
    const query = req.query.query;

    const products = await ProductModel.find({
      name: { $regex: query, $options: "i" },
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error searching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Error searching products" });
  }
};

module.exports = {
  quickView,
  getImage,
  filterCategoryProduct,
  filterAllProducts,
  searchProducts,
};
