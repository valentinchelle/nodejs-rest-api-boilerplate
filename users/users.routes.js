const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../auth/middlewares/auth.middleware");
const UsersController = require("./controllers/users.controller");

router.get("/", [AuthMiddleware.validJWTNeeded, UsersController.list]);
router.patch("/:userId", [
  AuthMiddleware.validJWTNeeded,
  UsersController.patchById
]);

module.exports = router;
