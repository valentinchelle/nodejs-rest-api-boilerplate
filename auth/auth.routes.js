const express = require("express");
const router = express.Router();
const passport = require("passport");

const AuthController = require("./controllers/auth.controller");

router.get(
  "/google",

  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @route POST api/users/register
// @desc Register user
// @access Public

router.post("/register", AuthController.registerUser);

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", AuthController.loginUser);

router.get("/google/callback", AuthController.loginGoogle);

module.exports = router;
