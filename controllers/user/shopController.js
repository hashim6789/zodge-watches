const ProductModel = require("../../models/ProductModel"); // Adjust the path as needed
const CategoryModel = require("../../models/Category");
const CartModel = require("../../models/Cart");
const UserModel = require("../../models/User");
const AddressModel = require("../../models/Address");
const OrderModel = require("../../models/Order");
const WishlistModel = require("../../models/Wishlist");

const { v4: uuidv4 } = require("uuid");

//for rendering the quick view (Product details page);
const quickView = async (req, res) => {
  try {
    const userId = req.session?.passport?.user?.id || req.session?.user?._id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId });
    const wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );
    const product = await ProductModel.findById(req.params.id);
    res.render("user/quickview", { product, ratings: 4, user, wishlist, cart });
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
    const categoryId = req.params.categoryId;
    let products = [];
    const category = await CategoryModel.findById(categoryId);
    if (category) {
      products = await ProductModel.find({ categoryId, isListed: true });
      console.log("products");

      if (products) {
        return res.status(200).json({
          status: "Success",
          message: "The products successfully fetched...",
          data: products,
        });
      }
    }
    res.status(404).json({
      status: "Failure",
      message: " The category doesn't exists",
    });
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
    const userId = req.session?.passport?.user?.id || req.session?.user?._id;
    let wishlist = null;
    if (userId) {
      wishlist = await WishlistModel.findOne({ userId });
    }
    const method = req.query.method;
    let products = [];

    if (method === "priceLowToHigh") {
      products = await ProductModel.find({ isListed: true })
        .sort({ price: 1 })
        .limit(8);
    } else if (method === "priceHighToLow") {
      products = await ProductModel.find({ isListed: true })
        .sort({ price: -1 })
        .limit(8);
    } else if (method === "lettersAscendingOrder") {
      products = await ProductModel.find({ isListed: true })
        .sort({ name: 1 })
        .limit(8);
    } else if (method === "lettersDescendingOrder") {
      products = await ProductModel.find({ isListed: true })
        .sort({ name: -1 })
        .limit(8);
    } else if (method === "popularity") {
      products = await ProductModel.find({ isListed: true })
        .sort({ soldCount: -1 })
        .limit(8);
    } else if (method === "newArrivals") {
      products = await ProductModel.find({ isListed: true })
        .sort({ createdAt: -1 })
        .limit(8);
    }

    // } else
    // if(method === 'PriceLowToHigh'){

    // } else

    if (products.length > 0) {
      res.status(200).json({
        status: "Success",
        message: "The products successfully fetched...",
        data: { products, wishlist },
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
      message: "The serverrrr error!!!",
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

//for adding a product into a wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const { productId } = req.body;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "Error", message: "Product not found!" });
    }

    let wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) {
      wishlist = new WishlistModel({
        userId,
        productIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    if (!wishlist.productIds.includes(productId)) {
      wishlist.productIds.push(productId);
    } else {
      return res.status(404).json({
        status: "failed",
        message: "Product already in wishlist",
      });
    }
    wishlist.save();
    return res.status(201).json({
      status: "Success",
      message: "The product is added to the wishlist successfully",
      data: wishlist,
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

//remove product from a wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const productId = req.params.productId;

    const product = await ProductModel.findById(productId);
    console.log(product);
    if (!product) {
      return res
        .status(404)
        .json({ status: "Error", message: "Product not found!" });
    }

    const wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) {
      return res
        .status(404)
        .json({ status: "Failed", message: "The wishlist is not found" });
    }

    const index = wishlist.productIds.indexOf(productId);
    if (index > -1) {
      wishlist.productIds.splice(index, 1);
    } else {
      return res.json({
        status: "Failed",
        message: "Product not found in wishlist",
      });
    }

    wishlist.save();
    res.status(200).json({
      status: "Success",
      message: "The product is removed from the wishlist",
      data: wishlist,
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

//for user cart page
const getCart = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId }) // Find cart by user ID
      .populate({
        path: "products.productId", // Populate the productId field in products array
        select: "_id name images stock", // Specify which fields to include from Products
      });
    const wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );

    req.session.steps = [];
    // const cartProducts = await ProductModel.find({ _id: { $in: productIds } });
    res.render("user/cartPage", { cart, user, wishlist });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

//for add to cart the product
const addToCart = async (req, res) => {
  try {
    const userId = req.session?.passport?.user?.id || req.session?.user?._id;
    const { quantity, productId } = req.body;

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
        price: product.price,
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

    return res.status(200).json({
      status: "Success",
      message: "The quantity is updated",
      product: cart.products[productIdx],
      cartTotal: cart.totalPrice,
    });
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
    const cart = await CartModel.findOne({ userId }) // Find cart by user ID
      .populate({
        path: "products.productId", // Populate the productId field in products array
        select: "_id name images stock", // Specify which fields to include from Products
      });
    const wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );
    console.log("cart = ", cart.products[0]);

    const addresses = await AddressModel.find({ userId });

    // const cartProducts = await ProductModel.find({ _id: { $in: productIds } });
    res.render("user/checkoutPage", { cart, user, wishlist, addresses });
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

// const getDeliveryAddress = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId });
//     const addresses = await AddressModel.find({ userId });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );

//     req.session.steps = ["cart", "checkout"];
//     res.render("user/deliveryAddressPage", {
//       cart,
//       user,
//       addresses,
//       wishlist,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postDeliveryAddress = async (req, res) => {
//   try {
//     const { selectedAddress } = req.body;
//     const Address = await AddressModel.findById(selectedAddress);
//     req.session.selectedAddress = Address;

//     if (!req.session.steps.includes("address")) {
//       req.session.steps.push("address");
//     }

//     res.redirect("/user/shop/payment");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const getPayment = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );
//     req.session.steps = ["cart", "checkout", "address"];

//     res.render("user/paymentMethodsPage", {
//       cart,
//       user,
//       wishlist,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postPayment = async (req, res) => {
//   try {
//     const { selectedPaymentMethod } = req.body;
//     req.session.selectedPaymentMethod = selectedPaymentMethod;

//     if (!req.session.steps.includes("payment")) {
//       req.session.steps.push("payment");
//     }
//     res.redirect("/user/shop/summary");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

const getSummary = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user?.id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId });
    const wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );
    const address = req.session.selectedAddress;
    const selectedPaymentMethod = req.session.selectedPaymentMethod;
    const cartProducts = [...req.session.cartProducts];

    req.session.steps = ["cart", "checkout", "address", "payment"];

    res.render("user/summaryPage", {
      cart,
      user,
      wishlist,
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
      orderId: generateOrderId(),
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
      product.soldCount += 1;
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
    return res.status(200).render("user/orderSuccessPage", { orderId });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

function generateOrderId() {
  // Fixed prefix for the order
  const prefix = "ORD";

  // Get the current timestamp in YYYYMMDDHHMMSS format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

  // Generate a UUID and extract the first 4 alphanumeric characters
  const uuidSegment = uuidv4()
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();

  // Combine all parts to form the order ID
  return `${prefix}${timestamp}${uuidSegment}`;
}

module.exports = {
  quickView,
  getImage,
  filterCategoryProduct,
  filterAllProducts,
  searchProducts,
  addToWishlist,
  removeFromWishlist,
  getCart,
  postCart,
  addToCart,
  updateQuantity,
  deleteCartProduct,
  getCheckout,
  postCheckout,
  // getDeliveryAddress,
  // postDeliveryAddress,
  // getPayment,
  // postPayment,
  getSummary,
  postPlaceOrder,
  getSuccessPage,
};
