const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const passport = require("passport");
// Load User model
const User = require("../../users/models/User");
const UsersController = require("../../users/controllers/users.controller");

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
          email: user.email
        };

        // Sign token
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res.status(400).json({ auth: "Password incorrect" });
      }
    });
  });
};

exports.loginGoogle = (req, res, next) => {
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
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 31556926 // 1 year in seconds
      },
      (err, token) => {
        return res
          .cookie("jwt", token, { httpOnly: true })
          .redirect(`http://localhost:3000/?token=${token}`);
      }
    );
  })(req, res, next);
};
exports.loginFacebook = (req, res, next) => {
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
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 31556926 // 1 year in seconds
      },
      (err, token) => {
        return res
          .cookie("jwt", token, { httpOnly: true })
          .redirect(`http://localhost:3000/?token=${token}`);
      }
    );
  })(req, res, next);
};
