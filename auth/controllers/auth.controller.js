const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const passport = require("passport");
// Load User model

const mongoose = require("mongoose");
var User = mongoose.model("User");
const UsersController = require("../../users/controllers/users.controller");

exports.generateTokens = (user, cb) => {
  // User needs to be identified with id
  // We generate the refresh token :
  // we generate a string
  let refreshId = user.id + process.env.JWT_SECRET;

  // We generate salt
  bcrypt.genSalt(10, function(err, salt) {
    // We hash the refresh token with the salt
    bcrypt.hash(refreshId, salt, function(err, refresh_token) {
      // We generate the jwttoken
      jwt.sign(
        user,
        process.env.JWT_SECRET,
        {
          expiresIn: 60 * 60 // 30 min in seconds
        },
        (err, jwttoken) => {
          cb(err, jwttoken, refresh_token);
        }
      );
    });
  });
};

exports.refresh_token = (req, res) => {
  // The refresh token has been validated by the middle ware before.

  console.log("[i] Reached refresh function");
  try {
    req.body = req.jwt;
    const userId = req.body.id;
    User.findOne({ _id: userId }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ auth: "Email not found" });
      }
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      };
      this.generateTokens(payload, (err, token, refresh_token) => {
        res.json({
          success: true,
          token: "Bearer " + token,
          refresh_token: refresh_token
        });
      });
    });
  } catch (err) {
    res.status(500).send({ errors: err });
  }
};

exports.registerUser = (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  return UsersController.insert(req, res);
};

exports.loginUser = (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ auth: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture
        };
        console.log(payload);
        this.generateTokens(payload, (err, token, refresh_token) => {
          if (err) {
            return res.status(400).json({ auth: "Error" });
          }
          res.json({
            success: true,
            token: "Bearer " + token,
            refresh_token: refresh_token
          });
        });
      } else {
        return res.status(400).json({ auth: "Password incorrect" });
      }
    });
  });
};

exports.loginGoogle = (req, res, next) => {
  const generateTokens = this.generateTokens;
  passport.authenticate("google", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    // User matched
    // Create JWT Payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    };

    generateTokens(payload, (err, token, refresh_token) => {
      if (err) {
        return res.status(400).json({ auth: "Error" });
      }
      return res.redirect(
        `http://localhost:3000/login?token=${token}&refresh_token=${refresh_token}`
      );
    });
  })(req, res, next);
};

exports.loginFacebook = (req, res, next) => {
  const generateTokens = this.generateTokens;
  passport.authenticate("facebook", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    // User matched
    // Create JWT Payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    };
    // Sign token

    generateTokens(payload, (err, token, refresh_token) => {
      return res.redirect(
        `http://localhost:3000/login?token=${token}&refresh_token=${refresh_token}`
      );
    });
  })(req, res, next);
};
