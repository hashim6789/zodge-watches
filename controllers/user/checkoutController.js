const UserModel = require("../../models/User");
const CartModel = require("../../models/Cart");
const WishlistModel = require("../../models/Wishlist");
const AddressModel = require("../../models/Address");

const getCheckout = async (req, res) => {
  try {
    const userId = req.user?._id;
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

// const ----------------------------------------------------------------------- = async (req, res) => {

// const ----------------------------------------------------------------------- = async (req, res) => {

// const ----------------------------------------------------------------------- = async (req, res) => {

// const ----------------------------------------------------------------------- = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const getDeliveryAddress = async (req, res) => {
// const postCheckout = (req, res) => {
//   try {
//     if (!req.session.steps.includes("checkout")) {
//       req.session.steps.push("checkout");
//     }
//     res.redirect("/user/shop/delivery-address");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

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

// const getSummary = async (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;
//     const user = await UserModel.findById(userId);
//     const cart = await CartModel.findOne({ userId });
//     const wishlist = await WishlistModel.findOne({ userId }).populate(
//       "productIds",
//       "name price images"
//     );
//     const address = req.session.selectedAddress;
//     const selectedPaymentMethod = req.session.selectedPaymentMethod;
//     const cartProducts = [...req.session.cartProducts];

//     req.session.steps = ["cart", "checkout", "address", "payment"];

//     res.render("user/summaryPage", {
//       cart,
//       user,
//       wishlist,
//       cartProducts,
//       address,
//       selectedPaymentMethod,
//     });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const postPlaceOrder = async (req, res) => {
//   try {
//     const { _id, userId, updatedAt, createdAt, __v, ...address } =
//       req.session.selectedAddress;

//     const paymentMethod = req.session.selectedPaymentMethod;
//     const totalPrice = req.session.cartProducts[0].totalPrice;
//     const products = [...req.session.cartProducts].map((product) => {
//       return {
//         productId: product.productId,
//         quantity: product.quantity,
//         price: product.productPrice,
//       };
//     });

//     const order = new OrderModel({
//       orderId: generateOrderId(),
//       userId,
//       address,
//       products,
//       totalPrice,
//       orderStatus: "placed",
//       paymentMethod,
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//     });

//     //for inventory management like manage the stock of the corresponding products
//     for (const item of products) {
//       const product = await ProductModel.findById(item.productId);
//       if (!product) {
//         return res
//           .status(404)
//           .json({ status: "Failed", message: "The product is not found" });
//       }
//       product.stock -= item.quantity;
//       product.soldCount += 1;
//       product.save();
//     }

//     //for the cart of the corresponding user in empty
//     const cart = await CartModel.findOne({ userId });
//     if (!cart) {
//       return res
//         .status(404)
//         .json({ status: "Failed", message: "The cart is not found" });
//     }
//     cart.products = [];
//     await cart.save();

//     await order.save();

//     if (!req.session.steps.includes("summary")) {
//       req.session.steps.push("summary");
//     }
//     return res.status(200).redirect("/user/shop/place-order");
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// const getSuccessPage = (req, res) => {
//   try {
//     const userId = req.session?.user?._id || req.session?.passport?.user?.id;

//     // console.log(req.session);
//     req.session.cartProducts = null;
//     req.session.selectedAddress = null;
//     req.session.selectedPaymentMethod = null;
//     req.session.steps = null;

//     req.session.steps = [];
//     return res.status(200).render("user/orderSuccessPage", { orderId });
//   } catch (err) {
//     res.status(500).json({ status: "Error", message: "Server Error!!!" });
//   }
// };

// function generateOrderId() {
//   // Fixed prefix for the order
//   const prefix = "ORD";

//   // Get the current timestamp in YYYYMMDDHHMMSS format
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
//   const day = String(now.getDate()).padStart(2, "0");
//   const hours = String(now.getHours()).padStart(2, "0");
//   const minutes = String(now.getMinutes()).padStart(2, "0");
//   const seconds = String(now.getSeconds()).padStart(2, "0");
//   const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

//   // Generate a UUID and extract the first 4 alphanumeric characters
//   const uuidSegment = uuidv4()
//     .replace(/[^a-zA-Z0-9]/g, "")
//     .substring(0, 4)
//     .toUpperCase();

//   // Combine all parts to form the order ID
//   return `${prefix}${timestamp}${uuidSegment}`;
// }

module.exports = { getCheckout };
