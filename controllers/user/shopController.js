const ProductModel = require("../../models/ProductModel"); // Adjust the path as needed

const quickView = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    res.render("user/quickview", { product, ratings: 4 });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server error");
  }
};

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

module.exports = { quickView, getImage };
