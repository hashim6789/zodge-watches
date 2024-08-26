const ProductModel = require("../../models/ProductModel"); // Adjust the path as needed
const CategoryModel = require("../../models/Category");
const CartModel = require("../../models/Cart");
const UserModel = require("../../models/User");
const AddressModel = require("../../models/Address");
const OrderModel = require("../../models/Order");

//for rendering the quick view (Product details page);
const quickView = async (req, res) => {
  try {
    const userId = req.session?.passport?.user?.id || req.session?.user?._id;
    const user = await UserModel.findById(userId);
    const product = await ProductModel.findById(req.params.id);
    res.render("user/quickview", { product, ratings: 4, user });
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

//for user cart page
const getCart = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId });
    const cartProducts = await CartModel.aggregate([
      {
        $match: {
          _id: cart._id,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "cartProductDetails",
        },
      },
      {
        $unwind: "$cartProductDetails",
      },
      {
        $project: {
          productName: "$cartProductDetails.name",
          productImages: "$cartProductDetails.images",
          productId: "$cartProductDetails._id",
          productPrice: "$cartProductDetails.price",
          quantity: "$products.quantity",
          productStock: "$cartProductDetails.stock",
        },
      },
    ]);

    req.session.steps = [];
    // const cartProducts = await ProductModel.find({ _id: { $in: productIds } });
    res.render("user/cartPage", { cart, user, cartProducts });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

//for add to cart the product
const addToCart = async (req, res) => {
  try {
    const { quantity, productId } = req.body;

    console.log(typeof quantity);

    const userId = req.session?.passport?.user?.id || req.session?.user?._id;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "Error", message: "Product not found!" });
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({
        userId: userId,
        products: [],
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (existingProductIndex > -1) {
      cart.products[existingProductIndex].quantity = quantity;
    } else {
      cart.products.push({
        productId: productId,
        quantity: quantity,
      });
    }

    cart.totalPrice += product.price * quantity;
    cart.updatedAt = Date.now();

    await cart.save();

    console.log("Product added to cart successfully");
    res.status(200).json({
      status: "Success",
      message: "Product added to cart!",
      cart: cart,
    });
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId, changeQuantity } = req.body;
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", message: "The cart is not found" });
    }

    const productIdx = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (productIdx === -1) {
      return res.status(404).json({
        status: "Failed",
        message: "The product is not found t=in the cart",
      });
    }

    cart.products[productIdx].quantity += changeQuantity;

    const total = await cart.products.reduce(
      async (totalPromise, currProduct) => {
        const total = await totalPromise;
        const product = await ProductModel.findById(currProduct.productId);

        if (!product) {
          throw new Error(`Product with ID ${currProduct.productId} not found`);
        }

        return total + product.price * currProduct.quantity;
      },
      Promise.resolve(0)
    );

    cart.totalPrice = total;

    cart.updatedAt = Date.now();
    await cart.save();

    return res
      .status(200)
      .json({ status: "Success", message: "The quantity is updated", cart });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const deleteCartProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const userId = req.session?.user?._id || req.session?.passport?.user?.id;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", message: "The cart is not found" });
    }

    cart.products = cart.products.filter(
      (product) => product.productId.toString() !== productId
    );

    const total = await cart.products.reduce(
      async (totalPromise, currProduct) => {
        const total = await totalPromise;
        const product = await ProductModel.findById(currProduct.productId);

        if (!product) {
          throw new Error(`Product with ID ${currProduct.productId} not found`);
        }

        return total + product.price * currProduct.quantity;
      },
      Promise.resolve(0)
    );

    cart.totalPrice = total;
    cart.updatedAt = Date.now();

    await cart.save();

    return res.status(200).json({
      status: "Success",
      message: "The product is deleted fron the cart",
      cart,
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const postCart = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const cart = await CartModel.findOne({ userId });
    const cartProducts = await CartModel.aggregate([
      {
        $match: {
          _id: cart._id,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "cartProductDetails",
        },
      },
      {
        $unwind: "$cartProductDetails",
      },
      {
        $project: {
          productName: "$cartProductDetails.name",
          productImages: "$cartProductDetails.images",
          productId: "$cartProductDetails._id",
          productPrice: "$cartProductDetails.price",
          quantity: "$products.quantity",
          productStock: "$cartProductDetails.stock",
          totalPrice: "$totalPrice",
        },
      },
    ]);
    req.session.cartProducts = [...cartProducts];
    if (!req.session.steps) {
      req.session.steps = [];
    }
    if (!req.session.steps.includes("cart")) {
      req.session.steps.push("cart");
    }

    res.redirect("/user/shop/checkout");
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const getCheckout = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId });
    const cartProducts = [...req.session.cartProducts];
    req.session.steps = ["cart"];
    return res.render("user/checkoutPage", { user, cart, cartProducts });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const postCheckout = (req, res) => {
  try {
    if (!req.session.steps.includes("checkout")) {
      req.session.steps.push("checkout");
    }
    res.redirect("/user/shop/delivery-address");
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const getDeliveryAddress = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId });
    const addresses = await AddressModel.find({ userId });

    req.session.steps = ["cart", "checkout"];
    res.render("user/deliveryAddressPage", {
      cart,
      user,
      addresses,
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const postDeliveryAddress = async (req, res) => {
  try {
    const { selectedAddress } = req.body;
    const Address = await AddressModel.findById(selectedAddress);
    req.session.selectedAddress = Address;

    if (!req.session.steps.includes("address")) {
      req.session.steps.push("address");
    }

    res.redirect("/user/shop/payment");
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const getPayment = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId });

    req.session.steps = ["cart", "checkout", "address"];

    res.render("user/paymentMethodsPage", {
      cart,
      user,
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const postPayment = async (req, res) => {
  try {
    const { selectedPaymentMethod } = req.body;
    req.session.selectedPaymentMethod = selectedPaymentMethod;

    if (!req.session.steps.includes("payment")) {
      req.session.steps.push("payment");
    }
    res.redirect("/user/shop/summary");
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const getSummary = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId });

    const address = req.session.selectedAddress;
    const selectedPaymentMethod = req.session.selectedPaymentMethod;
    const cartProducts = [...req.session.cartProducts];

    req.session.steps = ["cart", "checkout", "address", "payment"];

    res.render("user/summaryPage", {
      cart,
      user,
      cartProducts,
      address,
      selectedPaymentMethod,
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const postPlaceOrder = async (req, res) => {
  try {
    const { _id, userId, updatedAt, createdAt, __v, ...address } =
      req.session.selectedAddress;

    const paymentMethod = req.session.selectedPaymentMethod;
    const totalPrice = req.session.cartProducts[0].totalPrice;
    const products = [...req.session.cartProducts].map((product) => {
      return {
        productId: product.productId,
        quantity: product.quantity,
        price: product.productPrice,
      };
    });

    const order = new OrderModel({
      userId,
      address,
      products,
      totalPrice,
      orderStatus: "placed",
      paymentMethod,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    //for inventory management like manage the stock of the corresponding products
    for (const item of products) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ status: "Failed", message: "The product is not found" });
      }
      product.stock -= item.quantity;
      product.save();
    }

    //for the cart of the corresponding user in empty
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "Failed", message: "The cart is not found" });
    }
    cart.products = [];
    await cart.save();

    await order.save();

    if (!req.session.steps.includes("summary")) {
      req.session.steps.push("summary");
    }
    return res.status(200).redirect("/user/shop/place-order");
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

const getSuccessPage = (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;

    // console.log(req.session);
    req.session.cartProducts = null;
    req.session.selectedAddress = null;
    req.session.selectedPaymentMethod = null;
    req.session.steps = null;

    req.session.steps = [];
    return res
      .status(200)
      .render("user/orderSuccessPage", { orderId: generateOrderId(userId) });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

function generateOrderId(userId) {
  const timestamp = Date.now();
  const orderId = `ORD-${userId}${timestamp}`;
  return orderId;
}

module.exports = {
  quickView,
  getImage,
  filterCategoryProduct,
  filterAllProducts,
  searchProducts,
  getCart,
  postCart,
  addToCart,
  updateQuantity,
  deleteCartProduct,
  getCheckout,
  postCheckout,
  getDeliveryAddress,
  postDeliveryAddress,
  getPayment,
  postPayment,
  getSummary,
  postPlaceOrder,
  getSuccessPage,
};
