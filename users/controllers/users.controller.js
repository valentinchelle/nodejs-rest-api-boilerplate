const UserModel = require("../models/User");
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
          // Calling the model to create the user
          UserModel.create(newUser)
            .then(user => {
              console.log("[i] User Created!");
              res.json(user);
            })
            .catch(function(error) {
              console.log(err);
            });
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
        console.log("[!] Error!! trying to find user with OAuth Id");
        return cb_fail(err);
      }
      // if there is already someone with that googleId
      if (userMatch) {
        console.log("[i] User Found!");
        cb_success(userMatch);
      } else {
        console.log("[i] Creating new user");
        console.log(email);
        // creating the new user
        const newUser0Auth = new User({
          OAuthProvider: provider,
          OAuthId: id_provider,
          name: name,
          familyname: familyName,
          profilePicture: picture,
          email: email
        });
        UserModel.create(newUser0Auth)
          .then(user => {
            console.log("[i] User Created!");
            cb_success(user);
          })
          .catch(function(error) {
            cb_fail(error);
          });
      }
    }
  ); // closes User.findONe
};

exports.list = (req, res) => {
  let limit =
    req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }
  console.log(UserModel.list);
  UserModel.list(limit, page).then(result => {
    res.status(200).send(result);
  });
};

exports.getById = (req, res) => {
  UserModel.findById(req.params.userId).then(result => {
    res.status(200).send(result);
  });
};

exports.patchById = (req, res) => {
  // We make sure to not patch the permissionLevel and id
  delete req.body["permissionLevel"];
  delete req.body["id"];
  console.log(req.jwt);
  // We make sure they try to modify themselves if they don't have the right permission
  if (req.params.userId == req.jwt.id || req.jwt.permissionLevel > 3) {
    var newUser = req.body;
    if (req.body.password) {
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;

          UserModel.patch(req.params.userId, newUser).then(result => {
            console.log(result);
            res.status(204).send({});
          });
        });
      });
    } else {
      UserModel.patch(req.params.userId, req.body).then(result => {
        console.log(result);
        res.status(204).send({});
      });
    }
  } else {
    res.status(403).send();
  }
};
