const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load User model
const User = require("../../models/User");

router.get("/google/callback", function(req, res, next) {
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
      email: user.email
    };

    // Sign token
    jwt.sign(
      payload,
      keys.secretOrKey,
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
});

module.exports = router;
