const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../auth/middlewares/auth.middleware");
const UsersController = require("./controllers/users.controller");
router.get("/users", [AuthMiddleware.validJWTNeeded, UsersController.list]);

module.exports = router;
