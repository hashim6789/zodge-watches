// middlewares/auth.js
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

function isAdmin(req, res, next) {
  if (req.session.adminId) {
    return next();
  }
  res.redirect("/admin/login");
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session.userId) {
    return res.redirect("/");
  } else if (req.session.adminId) {
    return res.redirect("/admin");
  }
  next();
}

module.exports = {
  isAuthenticated,
  isAdmin,
  redirectIfAuthenticated,
};
