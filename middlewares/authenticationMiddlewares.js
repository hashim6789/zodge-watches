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

// for login, signup

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session?.admin && req.session?.admin?.role === "Admin") {
    return res.redirect("/admin/dashboard");
  } else if (
    req.session?.user === "User" ||
    req.session?.passport?.user?.role === "User"
  ) {
    return res.redirect("/user/auth/home");
  }
  next();
};

module.exports = {
  isAuthenticatedAdmin,
  isAuthenticatedUser,
  redirectIfAuthenticated,
};
