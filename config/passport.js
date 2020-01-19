const JwtStrategy = require("passport-jwt").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

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
        callbackURL: "/api/users/google/callback"
      },
      function(token, tokenSecret, profile, done) {
        // testing
        console.log("===== GOOGLE PROFILE =======");
        console.log(profile);
        console.log("======== END ===========");
        // code
        const { id, name } = profile;
        profile_json = profile._json;
        User.findOne({ "google.googleId": id }, (err, userMatch) => {
          // handle errors here:
          if (err) {
            console.log("Error!! trying to find user with googleId");
            console.log(err);
            return done(null, false);
          }
          // if there is already someone with that googleId
          if (userMatch) {
            console.log("asdfsdfasdf");
            console.log(userMatch);
            return done(null, userMatch);
          } else {
            // if no user in our db, create a new user with that googleId
            console.log("====== PRE SAVE =======");
            console.log(id);
            console.log(profile);

            console.log("====== post save ....");
            const newGoogleUser = new User({
              "google.googleId": id,
              name: name.givenName,
              familyName: name.familyName,
              //profilePicture: profile_json.picture,
              email: profile_json.email
            });

            console.log(newGoogleUser);
            // save this user
            newGoogleUser.save((err, savedUser) => {
              if (err) {
                console.log("Error!! saving the new google user");
                console.log(err);
                return done(null, false);
              } else {
                return done(null, savedUser);
              }
            }); // closes newGoogleUser.save
          }
        }); // closes User.findONe
      }
    )
  );
};
