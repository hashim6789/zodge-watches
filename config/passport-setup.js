const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const authRoute = require("../routes/user/authRoute");
require("dotenv").config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  "google-signup",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/user/auth/google/signup/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("testing");
      // Check if user already exists in our database
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          // User already exists, handle as an error or redirect to login
          return done(null, false, {
            message: "User already exists. Please log in.",
          });
        } else {
          // If not, create a new user
          new User({
            googleId: profile.id,
            username: profile.displayName,
            thumbnail: profile.photos[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            isVerified: true,
            email: profile.emails[0].value,
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);

passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/user/auth/google/login/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("testing 1");
      // Check if user already exists in our database
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          // User exists, log them in
          done(null, currentUser);
        } else {
          // User does not exist, handle as an error or redirect to signup
          return done(null, false, {
            message: "User does not exist. Please sign up.",
          });
        }
      });
    }
  )
);
