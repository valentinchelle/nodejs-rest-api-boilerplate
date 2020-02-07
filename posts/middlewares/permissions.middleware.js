const jwt = require("jsonwebtoken"),
  secret = process.env.JWT_SECRET;
const mongoose = require("mongoose");

const Post = mongoose.model("Post");
const config = require("../../config/config");
const ADMIN_PERMISSION = config.permissionLevels.ADMIN;

exports.onlyAuthorOrAdminCanDoThisAction = (req, res, next) => {
  let user_permission_level = parseInt(req.jwt.permissionLevel);
  let userId = req.jwt.id;
  let postid = req.params.id;
  if (user_permission_level & ADMIN_PERMISSION) {
    return next();
  } else {
    Post.findById(postid)
      .then(function(post) {
        if (post.author == userId) {
          return next();
        } else {
          return res
            .status(403)
            .send({ error: "Not authorized to edit this post" });
        }
      })
      .catch(() => {
        return res
          .status(403)
          .send({ error: "This post doesn't seem to exist" });
      });
  }
};
