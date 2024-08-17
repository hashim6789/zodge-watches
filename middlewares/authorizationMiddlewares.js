// middleware/authorizationMiddleware.js

// for user authorization
function authorizeUser(req, res, next) {
  if (
    req.session.user?.role === "User" ||
    req.session.passport?.user?.role === "User"
  ) {
    return next();
  } else {
    return res.status(403).send("Access denied");
  }
}

// for admin authorization
function authorizeAdmin(req, res, next) {
  if (req.session.admin?.role === "Admin") {
    return next();
  } else {
    return res.status(403).send("Access denied");
  }
}

// Specific authorization for different admin modules
function authorizeAdminForModule(module) {
  return function (req, res, next) {
    if (
      req.session.admin?.role === "Admin" &&
      req.session.admin?.permissions.includes(module)
    ) {
      return next();
    } else {
      return res.status(403).send("Access denied");
    }
  };
}

module.exports = {
  authorizeUser,
  authorizeAdmin,
  authorizeAdminForModule,
};
