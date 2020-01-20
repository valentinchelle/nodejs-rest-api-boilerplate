const UserModel = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

exports.insert = (req, res) => {
  console.log("[i] Inserting new user");
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
};

exports.loginOAuth = (
  email,
  name,
  familyName,
  provider,
  id_provider,
  picture = "",
  cb_success,
  cb_fail
) => {
  /* Adds a passwordless acount for 0Auth users if account doesnt exist, or log in if it does.
  - provider in ["Google"]
  - id-provider = identifier for this provider
  - cb_match_success = callback if user found/created function(user)
  - cb_success = callback function(user)
  - cb_fail = callback function(err)
  */
  // We lookup if already exist
  console.log("[i] Login via Oauth");
  User.findOne(
    { OAuthId: id_provider, OAuthProvider: provider, email: email },
    (err, userMatch) => {
      // handle errors here:
      if (err) {
        console.log("Error!! trying to find user with OAuth Id");
        return cb_fail(err);
      }
      // if there is already someone with that googleId
      if (userMatch) {
        console.log("[i] User Found!");
        cb_success(userMatch);
      } else {
        console.log("[i] Creating new user");
        // creating the new user
        const newUser0Auth = new User({
          OAuthProvider: provider,
          OAuthId: id_provider,
          name: name,
          familyname: familyName,
          profilePicture: picture,
          email: email
        });
        console.log(newUser0Auth);
        newUser0Auth
          .save()
          .then(user => {
            console.log("[i] User Created!");
            cb_success(user);
          })
          .catch(err => cb_fail(err));
      }
    }
  ); // closes User.findONe
};
