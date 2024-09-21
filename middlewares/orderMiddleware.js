// Middleware to check if the user's cart exists and is not empty
const checkCartExists = (req, res, next) => {
  console.log("session cart = ", req.session.cart);
  if (req.session?.cart && req.session.cart?.products.length > 0) {
    return next();
  } else {
    return res.redirect("/cart");
  }
};

// Middleware to check if an order exists and is confirmed
const checkOrderExists = (req, res, next) => {
  console.log("session order = ", req.session.order);
  if (
    req.session?.order &&
    (req.session.order.orderStatus === "placed" ||
      req.session.order.orderStatus === "pending")
  ) {
    return next();
  } else {
    return res.redirect("/");
  }
};

module.exports = {
  checkCartExists,
  checkOrderExists,
};
