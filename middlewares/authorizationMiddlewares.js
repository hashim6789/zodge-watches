// middleware/authorizationMiddleware.js

// Check if the user has access to user-specific routes
function authorizeUser(req, res, next) {
  if (req.session.user.role === "User") {
    return next(); // User is authorized, proceed
  } else {
    return res.status(403).send("Access denied"); // Forbidden
  }
}

// Check if the admin has access to admin-specific modules
function authorizeAdmin(req, res, next) {
  if (req.session.admin.role === "Admin") {
    return next(); // Admin is authorized, proceed
  } else {
    return res.status(403).send("Access denied"); // Forbidden
  }
}

// Specific authorization for different admin modules
function authorizeAdminForModule(module) {
  return function (req, res, next) {
    if (
      req.session.admin.role === "Admin" &&
      req.session.admin.permissions.includes(module)
    ) {
      return next(); // Admin has permission for this module, proceed
    } else {
      return res.status(403).send("Access denied"); // Forbidden
    }
  };
}

module.exports = {
  authorizeUser,
  authorizeAdmin,
  authorizeAdminForModule,
};
