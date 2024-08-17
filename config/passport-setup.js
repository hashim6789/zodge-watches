const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const authRoute = require("../routes/user/authRoute");
require("dotenv").config();

/**----------------------USER SERIALIZERS------------------ */
passport.serializeUser((user, done) => {
  done(null, { id: user._id, email: user.email, role: user.role });
});

passport.deserializeUser((obj, done) => {
  User.findById(obj.id).then((user) => {
    done(null, user);
  });
});

/**----------------------GOOGLE STRATEGIES------------------ */

//for google signup
passport.use(
  "google-signup",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/user/auth/google/signup/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({
          email: profile.emails[0].value,
        });
        if (existingUser) {
          if (!existingUser.googleId) {
            existingUser = await User.findOneAndUpdate(
              { email: profile.emails[0].value },
              {
                $set: {
                  googleId: profile.id,
                  thumbnail: profile.photos[0].value,
                  firstName: profile.name.givenName,
                  lastName: profile.name.familyName,
                  isVerified: true,
                },
              },
              { new: true }
            );

            return done(null, existingUser);
          } else {
            return done(null, false, {
              message: "User already exists. Please log in.",
            });
          }
        } else {
          const newUser = new User({
            googleId: profile.id,
            username: profile.displayName,
            thumbnail: profile.photos[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            isVerified: true,
            email: profile.emails[0].value,
          });
          await newUser.save();
          done(null, newUser);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

//for google login
passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/user/auth/google/login/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({
          googleId: profile.id,
          isBlocked: false,
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        existingUser = await User.findOne({
          email: profile.emails[0].value,
          isBlocked: false,
        });

        if (existingUser) {
          existingUser.googleId = profile.id;
          existingUser.thumbnail = profile.photos[0].value;
          await existingUser.save();

          return done(null, existingUser);
        } else {
          return done(null, false, {
            message: "User does not exist or blocked. Please sign up.",
          });
        }
      } catch (error) {
        done(error);
      }
    }
  )
);
