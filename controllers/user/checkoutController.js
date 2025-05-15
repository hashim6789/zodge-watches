const UserModel = require("../../models/User");
const CartModel = require("../../models/Cart");
const WishlistModel = require("../../models/Wishlist");
const AddressModel = require("../../models/Address");
const ProductModel = require("../../models/Product");
const OrderModel = require("../../models/Order");
const WalletModel = require("../../models/Wallet");
const CouponModel = require("../../models/Coupon");

const { sendOrderConfirmationEmail } = require("../../utils/emailSender");

const { createOrder } = require("../../config/razorpayService");
const { v4: uuidv4 } = require("uuid");

//get the checkout page
const getCheckout = async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = await UserModel.findById(userId);
    const cart = await CartModel.findOne({ userId }).populate({
      path: "products.productId",
      select: "_id name images stock",
    });
    const wishlist = await WishlistModel.findOne({ userId }).populate(
      "productIds",
      "name price images"
    );
    console.log("cart = ", cart.products[0]);

    const addresses = await AddressModel.find({ userId });

    res.render("user/checkoutPage", { cart, user, wishlist, addresses });
  } catch (err) {
    res.status(500).json({ status: "Error", message: "Server Error!!!" });
  }
};

//get the address during the checkout time
const getAddress = async (req, res) => {
  try {
    const index = req.params.index;
    const user = req.user;
    const userId = req.user._id;
    const addresses = await AddressModel.find({ userId });

    if (user && addresses && addresses[index]) {
      res.json(addresses[index]);
    } else {
      res.status(404).json({ error: "Address not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user?._id;

    console.log(couponCode, userId);

    const coupon = await CouponModel.findOne({
      code: couponCode,
      isListed: true,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found or inactive." });
    }

    if (coupon.expiryDate < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired." });
    }

    const cart = await CartModel.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }
    console.log(cart.totalPrice, coupon.minPurchaseAmount);

    if (cart.totalPrice < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount for this coupon is ₹${coupon.minPurchaseAmount}.`,
      });
    }

    let discountAmount = (cart.totalPrice * coupon.discountPercentage) / 100;

    if (
      coupon.maxDiscountAmount > 0 &&
      discountAmount > coupon.maxDiscountAmount
    ) {
      discountAmount = coupon.maxDiscountAmount;
    }

    cart.coupon = {
      code: coupon.code,
      discountAmount: discountAmount,
      discountPercentage: coupon.discountPercentage,
      maxDiscountAmount: coupon.maxDiscountAmount,
    };

    cart.totalPrice -= discountAmount;

    await cart.save();

    coupon.usedCount += 1;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully!",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const removeCoupon = async (req, res) => {
  try {
    const userId = req.user?._id;

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    if (!cart.coupon || !cart.coupon.code) {
      return res
        .status(400)
        .json({ success: false, message: "No coupon applied to the cart." });
    }

    const discountAmount = cart.coupon.discountAmount;
    cart.totalPrice += discountAmount;

    cart.coupon = {
      discountAmount: null,
      code: null,
      discountPercentage: null,
      maxDiscountAmount: null,
    };

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Coupon removed successfully!",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//proceed to payment or cod or wallet
const postCheckout = async (req, res) => {
  try {
    const { userId, products, coupon, address, paymentMethod } = req.body;

    if (
      !userId ||
      !address.addressLine ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.email ||
      !address.firstName ||
      !address.phoneNo ||
      !paymentMethod
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    let totalPrice = 0;
    const orderProducts = [];

    for (const product of products) {
      const foundProduct = await ProductModel.findById(
        product.productId
      ).populate("offers");

      if (!foundProduct || foundProduct.stock < product.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.productId}`,
        });
      }

      let discountValue = 0;
      if (foundProduct.offers.length > 0) {
        const activeOffers = foundProduct.offers.filter(
          (offer) => offer.isActive
        );

        if (activeOffers.length > 0) {
          const highestOffer = activeOffers.reduce((maxOffer, currentOffer) => {
            return currentOffer.discountValue > maxOffer.discountValue
              ? currentOffer
              : maxOffer;
          });

          discountValue = highestOffer.discountValue;
        }
      }

      const discountedPrice = Math.max(foundProduct.price - discountValue, 0); // Ensure price is not negative

      const productTotal = discountedPrice * product.quantity;
      totalPrice += productTotal;

      foundProduct.stock -= product.quantity;
      foundProduct.reservedStock += product.quantity;
      await foundProduct.save();

      orderProducts.push({
        productId: product.productId,
        quantity: product.quantity,
        price: discountedPrice,
      });
    }

    let couponDiscount = 0;
    if (coupon?.discountAmount) {
      totalPrice -= coupon.discountAmount;
      couponDiscount = coupon.discountAmount;
    }

    const deliveryCharge = 50;
    totalPrice += deliveryCharge;
    console.log("Total = ", totalPrice);
    let newOrder = new OrderModel({
      orderId: generateOrderId(),
      userId,
      products: orderProducts,
      couponDiscount,
      totalPrice,
      orderStatus: "pending",
      address,
      paymentMethod,
    });

    await newOrder.save();
    req.session.order = newOrder;

    const cart = await CartModel.findOne({ userId });
    cart.products = [];
    cart.coupon = {};
    cart.totalPrice = 0;

    await cart.save();
    delete req.session.cart;

    if (paymentMethod === "cod") {
      newOrder.orderStatus = "placed";
      newOrder.save();
      await finalizeStockReduction(orderProducts);
      await sendOrderConfirmationEmail(newOrder);
      res.status(200).json({
        message: "Order placed successfully with cash on delivery!",
        order: newOrder,
      });
    } else if (paymentMethod === "wallet") {
      const wallet = await WalletModel.findOne({ userId });

      if (!wallet) {
        return res
          .status(404)
          .json({ success: false, message: "the wallet is not found" });
      }

      if (wallet.balance < totalPrice) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient wallet balance." });
      }
      wallet.balance -= totalPrice;

      wallet.transactions.push({
        type: "debit",
        amount: totalPrice,
        description: `Purchase for order #${newOrder.orderId}`,
      });
      await wallet.save();

      newOrder.orderStatus = "placed";
      newOrder.paymentStatus = "successful";
      newOrder.save();

      await finalizeStockReduction(orderProducts);
      await sendOrderConfirmationEmail(newOrder);

      return res.status(200).json({
        success: true,
        message: "Order placed successfully using Wallet!",
        order: newOrder,
      });
    } else if (paymentMethod === "onlinePayment") {
      const options = {
        amount: totalPrice,
        currency: "INR",
        receipt: newOrder.orderId,
      };

      const razorpayOrder = await createOrder(options);
      console.log(razorpayOrder, "ttttt");

      newOrder.razorpayOrderId = razorpayOrder.id;
      await newOrder.save();

      return res.status(200).json({
        message: "Proceed to payment",
        orderId: newOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error!!!" });
  }
};

const retryPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.paymentStatus !== "pending") {
      return res.status(400).json({
        message: "Payment for this order cannot be retried.",
      });
    }

    const options = {
      amount: order.totalPrice,
      currency: "INR",
      receipt: order.orderId,
    };

    const razorpayOrder = await createOrder(options);
    console.log(razorpayOrder);

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = "pending";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment retry initiated. Proceed to payment.",
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during payment retry." });
  }
};

//finally the order confirmation page rendering
const getOrderConfirmation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = await UserModel.findById(userId);
    const wishlist = await WishlistModel.findOne({ userId });
    const cart = await CartModel.findOne({ userId });
    const orderId = req.session?.order._id;
    console.log(orderId);
    const order = await OrderModel.findById(orderId)
      .populate("userId")
      .populate("products.productId");

    console.log(order);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    delete req.session.order;
    res.render("user/orderSuccessPage", {
      user,
      wishlist,
      cart,
      orderId: order.orderId,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Server Error!!!" });
  }
};

//for payment retry , when the payment may be failed at the time we want to retry the payment
const getPaymentRetryPage = (req, res) => {
  try {
    const failedOrder = req.session.failedOrder || {};
    res.render("paymentFailed", {
      user: req.user,
      failedOrder: failedOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error!!!" });
  }
};

function generateOrderId() {
  const prefix = "ORD";

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

  const uuidSegment = uuidv4()
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 4)
    .toUpperCase();

  return `${prefix}${timestamp}${uuidSegment}`;
}

const finalizeStockReduction = async (orderProducts) => {
  for (const product of orderProducts) {
    const foundProduct = await ProductModel.findById(product.productId);
    if (foundProduct) {
      foundProduct.reservedStock -= product.quantity;
      await foundProduct.save();
    }
  }
};

module.exports = {
  getCheckout,
  getAddress,
  applyCoupon,
  removeCoupon,
  postCheckout,
  retryPayment,
  getOrderConfirmation,
  getPaymentRetryPage,
};
