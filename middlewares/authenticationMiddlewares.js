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
  if (req.session?.user || req.session.passport?.user?.role === "User") {
    return next();
  } else {
    return res.redirect("/user/auth/login");
  }
};

//check if the user is blocked
const checkBlocked = async (req, res, next) => {
  const email = req.session?.user?.email || req.session?.passport?.user?.email;
  let user = { isBlocked: false };
  console.log(email);
  if (email) {
    user = await UserModel.findOne({ email });
  }
  if (!user.isBlocked) {
    return next();
  }
  res.redirect("/user/auth/logout");
};

// for login, signup
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session?.admin && req.session?.admin?.role === "Admin") {
    return res.redirect("/admin/dashboard");
  } else if (
    req.session?.user?.role === "User" ||
    req.session?.passport?.user?.role === "User"
  ) {
    const returnTo = req.session.returnTo || "/user/auth/home"; // Use the stored return URL or default to home
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
