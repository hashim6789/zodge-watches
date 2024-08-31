const express = require("express"); //import the express
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();
// const methodOverride = require("method-override");
const adminRouter = require("./routes/adminRoute"); //import the local module router for admin
const userRouter = require("./routes/userRoute"); //import the local module router for admin/products
const orderRouter = require("./routes/orderRoute"); //import the local module router for admin/orders
const categoryRouter = require("./routes/categoryRoute"); //import the local module router for admin/categories
const productRouter = require("./routes/productRoute"); //import the local module router for admin/products
const dummyRouter = require("./routes/user/dummyRoute"); //import the local module router for user/dummy for testing
const authRouter = require("./routes/user/authRoute"); //import the local module router for user/auth
const shopRouter = require("./routes/user/shopRoute"); //import the local module router for user/shop
const profileRouter = require("./routes/user/profileRoute"); //import the local module router for user/profile
const passportSetup = require("./config/passport-setup");
const session = require("express-session"); //import session
const passport = require("passport");
const { v4: uuidv4 } = require("uuid"); //import unique id
// const MongoDbSession = require("connect-mongodb-session")(session);
const connectDB = require("./db");
const mongoose = require("mongoose");
const app = express();

//for port number
const port = process.env.PORT || 3000;

// connect with mongoDB
connectDB();

//for setting view engine (ejs)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middlewares
app.use(express.json()); //for parse to json
app.use(express.urlencoded({ extended: true })); // for url encode
// app.use(methodOverride("_method")); // for method spoofing (delete, put, patch)

// session handling
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

//for cache handling
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});

// Middleware to serve static files
app.use("/public", express.static(path.join(__dirname, "public")));

//for morgan middleware for auditing the requests
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// app.use("/", userRouter); // for user router url
app.use("/admin/users", userRouter); // for admin - user management router url
app.use("/admin/orders", orderRouter); // for admin - order management router url
app.use("/admin/categories", categoryRouter); // for admin - category management router url
app.use("/admin/products", productRouter); // for admin product management router url
app.use("/admin", adminRouter); // for admin router url

app.use("/user/dummy", dummyRouter); // for testing the router
app.use("/user/auth", authRouter); // for user authentication router url
app.use("/user/shop", shopRouter); // for user shopping router url
app.use("/user/profile", profileRouter); // for user shopping router url

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).render("_404");
});

//server listener
app.listen(port, () => {
  console.log(`The server started at http://localhost:${port}`);
});
