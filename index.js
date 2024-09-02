const express = require("express"); //import the express
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();
// const methodOverride = require("method-override");
const adminRouter = require("./routes/admin/index"); //import the local module router for admin
const userRouter = require("./routes/user/index"); //import the local module router for admin
// const userRouter = require("./routes/userRoute"); //import the local module router for admin/products
// const orderRouter = require("./routes/orderRoute"); //import the local module router for admin/orders
// const categoryRouter = require("./routes/categoryRoute"); //import the local module router for admin/categories
// const productRouter = require("./routes/productRoute"); //import the local module router for admin/products
// const homeRouter = require("./routes/user/homeRoute"); //import the local module router for / for testing
// const authRouter = require("./routes/user/authRoute"); //import the local module router for user/auth
// const shopRouter = require("./routes/user/shopRoute"); //import the local module router for user/shop
// const profileRouter = require("./routes/user/profileRoute"); //import the local module router for user/profile
require("./config/passport-setup");
const session = require("express-session"); //import session
const passport = require("passport");
const { v4: uuidv4 } = require("uuid"); //import unique id
// const MongoDbSession = require("connect-mongodb-session")(session);
const connectDB = require("./db");
const mongoose = require("mongoose");
const Wishlists = require("./models/Wishlist");
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

// app.use("/", homeRouter); // for testing the router
// app.use("/", userRouter); // for user router url
// app.use("/admin/users", userRouter); // for admin - user management router url
// app.use("/admin/orders", orderRouter); // for admin - order management router url
// app.use("/admin/categories", categoryRouter); // for admin - category management router url
// app.use("/admin/products", productRouter); // for admin product management router url
app.use("/admin", adminRouter); // for admin router url
app.use("/", userRouter); // for admin router url

// app.use("/user/auth", authRouter); // for user authentication router url
// app.use("/user/shop", shopRouter); // for user shopping router url
// app.use("/user/profile", profileRouter); // for user shopping router url

//for testing

app.get("/new", (req, res) =>
  res.render("user/newProfile", {
    user: {
      _id: "66ba12a0b60c8ee3d46812fd",
      googleId: "null",
      firstName: "Jasim",
      lastName: "Ihsan M",
      email: "jasimihsan1234@gmail.com",
      password: "$2a$10$9UZC0UoF8a7p2dMedJpFw.mjvqorlcKLVvkfyRCmivAYKOdyLrGJm",
      role: "User",
      isBlocked: false,
      isVerified: true,
      createdAt: "2024-08-12T13:48:16.243+00:00",
      updatedAt: "2024-08-12T13:48:16.243+00:00",
      __v: 0,
    },
    cart: {
      _id: "66c1a7e3bd5a4a3884bb8e54",
      products: [
        {
          productId: "66b21066179e1372e38545b6",
          quantity: 2,
          _id: "66d2a4ed936a39f6288bd37f",
        },
        {
          productId: "66b20c63179e1372e3854593",
          quantity: 1,
          _id: "66d3338332314ede4aca8055",
        },
      ],
      totalPrice: 88770,
      updatedAt: "2024-08-31T15:15:15.898Z",
      createdAt: "2024-08-18T07:50:59.431Z",
      userId: "66be0418910daec07a9d471f",
      __v: 116,
    },
    wishlist: {
      _id: "66ce2df04115ce71e7692ac1",
      userId: "66be0418910daec07a9d471f",
      updatedAt: "2024-08-27T19:50:08.653Z",
      productIds: [
        {
          _id: "66b20d3c179e1372e3854598",
          name: "Titan Men's Timeless Style Watch",
          price: 3195,
          images: [Array],
        },
        {
          _id: "66b20c63179e1372e3854593",
          name: "Titan Zeal with 4.69 cm AMOLED Display",
          price: 13500,
          images: [Array],
        },
      ],
      createdAt: "2024-08-27T19:50:08.653Z",
      __v: 84,
    },
  })
);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).render("_404");
});

//server listener
app.listen(port, () => {
  console.log(`The server started at http://localhost:${port}`);
});
