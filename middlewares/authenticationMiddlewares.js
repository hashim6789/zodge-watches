const UserModel = require("../models/User");

// for admin authentication
const isAuthenticatedAdmin = (req, res, next) => {
  if (req.session?.admin) {
    return next();
  } else {
    return res.redirect("/admin/login");
  }
};

// for user authentication
const isAuthenticatedUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/auth/login");
  }
};

//check if the user is blocked
const checkBlocked = async (req, res, next) => {
  const email = req.user?.email;
  let user = { isBlocked: false };
  console.log(email);
  if (email) {
    user = await UserModel.findOne({ email });
  }
  if (!user.isBlocked) {
    return next();
  }
  res.redirect("/auth/logout");
};

// for login, signup
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session?.admin && req.session?.admin?.role === "Admin") {
    return res.redirect("/admin/dashboard");
  } else if (req.isAuthenticated()) {
    const returnTo = req.session.returnTo || "/"; // Use the stored return URL or default to home
    delete req.session.returnTo; // Clear it after using
    return res.redirect(returnTo);
  }
  next();
};

// track the previous page url
function trackPreviousPage(req, res, next) {
  req.session.returnTo = req.originalUrl;
  next();
}
module.exports = {
  isAuthenticatedAdmin,
  isAuthenticatedUser,
  checkBlocked,
  redirectIfAuthenticated,
  trackPreviousPage,
};
