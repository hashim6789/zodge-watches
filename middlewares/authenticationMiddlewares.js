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
  console.log(req.session);
  if (req.session?.user || req.session.passport?.user?.role === "User") {
    return next();
  } else {
    return res.redirect("/user/auth/login");
  }
};

//check if the user is blocked
const checkBlocked = async (req, res, next) => {
  const email = req.session?.user?.email || req.session?.passport?.user?.email;
  const { isBlocked } = await UserModel.findOne({ email });
  if (isBlocked) {
    return res.redirect("/user/auth/logout");
  }
  next();
};

// for login, signup
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session?.admin && req.session?.admin?.role === "Admin") {
    return res.redirect("/admin/dashboard");
  } else if (
    req.session?.user?.role === "User" ||
    req.session?.passport?.user?.role === "User"
  ) {
    return res.redirect("/user/auth/home");
  }
  next();
};

module.exports = {
  isAuthenticatedAdmin,
  isAuthenticatedUser,
  checkBlocked,
  redirectIfAuthenticated,
};
