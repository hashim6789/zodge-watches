const admin = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD, // In real applications, ensure to hash the password
  role: process.env.ADMIN_ROLE,
  permissions: process.env.ADMIN_PERMISSIONS.split(","),
};

// Check if the admin is authenticated
function isAuthenticatedAdmin(req, res, next) {
  if (req.session.admin) {
    return next(); // Admin is authenticated, proceed
  } else {
    return res.redirect("/admin/login"); // Redirect to admin login if not authenticated
  }
}

// Check if the user is authenticated
function isAuthenticatedUser(req, res, next) {
  console.log(req.session);
  if (req.session.user) {
    return next(); // User is authenticated, proceed
  } else {
    return res.redirect("user/auth/login"); // Redirect to login if not authenticated
  }
}

// middleware/redirectIfAuthenticated.js

function redirectIfAuthenticated(req, res, next) {
  if (req.session.admin && req.session.admin.role === "Admin") {
    return res.redirect("/admin/dashboard"); // Redirect to dashboard if authenticated
  } else if ((req.session.user && req, session.user === "User")) {
    return res.redirect("/user/auth/home");
  }
  next(); // Proceed if not authenticated
}

module.exports = {
  isAuthenticatedAdmin,
  isAuthenticatedUser,
  redirectIfAuthenticated,
};
