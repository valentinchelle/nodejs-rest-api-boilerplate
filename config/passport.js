const JwtStrategy = require("passport-jwt").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

const User = require("../users/models/User");
const UsersController = require("../users/controllers/users.controller");

module.exports = passport => {
  // Local Strategy
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
      },
      function(token, tokenSecret, profile, done) {
        // we retrieve the data we need from google
        const { googleid, name } = profile;
        profile_json = profile._json;

        // We use the loginOAuth defined in the controller of the users
        UsersController.loginOAuth(
          profile_json.email,
          name.givenName,
          name.familyName,
          "google",
          googleid,
          function(user) {
            return done(null, user);
          },
          function(err) {
            console.log(err);
            return done(null, false);
          }
        );
      }
    )
  );
};
