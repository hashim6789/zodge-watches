const UserModel = require("../models/User");
const passport = require("passport");

// for admin authentication
const isAuthenticatedAdmin = (req, res, next) => {
  if (req.session?.admin) {
    return next();
  } else {
    return res.redirect("/admin/login");
  }
};

// Helper function to determine if the request is an API call
const isApiRequest = (req) => {
  return req.xhr || req.headers["content-type"] === "application/json";
};

// For user authentication
const isAuthenticatedUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  if (isApiRequest(req)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Please log in to perform this action.",
    });
  } else {
    return res.redirect("/");
  }
};

// Check if the user is blocked
const checkBlocked = async (req, res, next) => {
  const email = req.user?.email;
  let user = { isBlocked: false };

  if (email) {
    user = await UserModel.findOne({ email });
  }

  if (!user.isBlocked) {
    return next();
  }

  req.logout();

  if (isApiRequest(req)) {
    return res.status(403).json({
      success: false,
      message: "Your account has been blocked. Please contact support.",
    });
  } else {
    return res.redirect("/auth/logout");
  }
};

// For checking if the user is verified
const isVerifiedUser = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    return next();
  }

  if (isApiRequest(req)) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email to perform this action.",
    });
  } else {
    return res.redirect(`/profile/${req.user?._id}`);
  }
};

// Redirect if authenticated
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session?.admin && req.session?.admin?.role === "Admin") {
    return res.redirect("/admin/dashboard");
  } else if (req.isAuthenticated()) {
    const returnTo = req.session.returnTo || "/";
    delete req.session.returnTo;
    return res.redirect(returnTo);
  }

  return next();
};

module.exports = {
  isAuthenticatedAdmin,
  isAuthenticatedUser,
  checkBlocked,
  redirectIfAuthenticated,
  isVerifiedUser,
};
