const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const authRoute = require("../routes/user/authRoute");
require("dotenv").config();

/**----------------------USER SERIALIZERS------------------ */
passport.serializeUser((user, done) => {
  done(null, { id: user._id, role: user.role });
});

passport.deserializeUser((obj, done) => {
  User.findById(obj.id).then((user) => {
    done(null, user);
  });
});

/**----------------------GOOGLE STRATEGIES------------------ */

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
        console.log("testing");
        // Check if user already exists in our database
        let existingUser = User.findOne({ email: profile.emails[0].value });
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
            // If the user already exists and has a googleId, handle it as an error
            return done(null, false, {
              message: "User already exists. Please log in.",
            });
          }
        } else {
          // If not, create a new user
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
        // Check if a user exists by googleId
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // If no googleId is found, check by email
        existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          // Update the user with the googleId
          existingUser.googleId = profile.id;
          existingUser.thumbnail = profile.photos[0].value;
          await existingUser.save();

          return done(null, existingUser);
        } else {
          return done(null, false, {
            message: "User does not exist. Please sign up.",
          });
        }
      } catch (error) {
        done(error);
      }
    }
  )
);
