const express = require("express");
const router = express.Router();
const config = require("../config/config");

const AuthMiddleware = require("../auth/middlewares/auth.middleware");

const PostPermissionMiddleware = require("../posts/middlewares/permissions.middleware");
const PermissionsMiddleware = require("../users/middlewares/permissions.middlewares");
const PostsController = require("./controllers/posts.controller");

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;

router.get("/feed/:page?", [PostsController.list]);
router.get("/:id", [PostsController.getById]);
router.post("/", [AuthMiddleware.validJWTNeeded, PostsController.insert]);
router.patch("/:id", [
  AuthMiddleware.validJWTNeeded,
  PostPermissionMiddleware.onlyAuthorOrAdminCanDoThisAction,
  PostsController.patchById
]);

module.exports = router;
