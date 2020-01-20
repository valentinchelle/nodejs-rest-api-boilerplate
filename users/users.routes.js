const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../auth/middlewares/auth.middleware");
const PermissionsMiddleware = require("../users/middlewares/permissions.middlewares");
const UsersController = require("./controllers/users.controller");

router.get("/", [AuthMiddleware.validJWTNeeded, UsersController.list]);
router.patch("/:userId", [
  AuthMiddleware.validJWTNeeded,
  PermissionsMiddleware.onlySameUserOrAdminCanDoThisAction,
  UsersController.patchById
]);

module.exports = router;
