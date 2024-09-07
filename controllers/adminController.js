require("dotenv").config();

const admin = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD, // In real applications, ensure to hash the password
  role: process.env.ADMIN_ROLE,
  permissions: process.env.ADMIN_PERMISSIONS.split(","),
};

/**---------------------------admin login------------------------ */

const getLogin = (req, res) => {
  res.render("admin/login", { err: req.query.error });
};

const postLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Set session
      req.session.admin = {
        email,
        role: "Admin",

        permissions: process.env.ADMIN_PERMISSIONS.split(","),
      };
      // console.log(req.session);
      // res
      //   .status(200)
      //   .json({ status: "success", message: "the user is login successfully" });
      res.redirect("/admin/dashboard");
    } else {
      // res
      //   .status(404)
      //   .json({ status: "failure", message: "the username or email incorrect" });
      res.redirect("/admin/login?error=Invalid email or password");
    }
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

//dashboard
const getDashboard = (req, res) => {
  // res.status(200).json({ status: "success", message: "Its, dashboard" });
  res.render("admin/adminDashboard", { pageType: null });
};

//for logout
const getLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("logout error:", err);
        return res.redirect("/admin/dashboard");
      }
      console.log(req.session);
      res.clearCookie("connect-cookie");
      res.redirect("/admin/login");
    });
  } catch (err) {
    res.status(500).json({
      status: "Error",
      message: "The server error",
    });
  }
};

module.exports = {
  getLogin,
  postLogin,
  getDashboard,
  getLogout,
};
