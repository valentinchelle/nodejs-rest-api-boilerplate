const jwt = require("jsonwebtoken"),
  secret = process.env.JWT_SECRET;

const config = require("../../config/config");
const ADMIN = config.permissionLevels.ADMIN;

exports.minimumPermissionLevelRequired = required_permission_level => {
  return (req, res, next) => {
    let user_permission_level = parseInt(req.jwt.permissionLevel);

    let userId = req.jwt.userId;
    if (user_permission_level & required_permission_level) {
      return next();
    } else {
      return res.status(403).send({ error: "Permission not granted" });
    }
  };
};

exports.onlySameUserOrAdminCanDoThisAction = (req, res, next) => {
  let user_permission_level = parseInt(req.jwt.permissionLevel);
  let userId = req.jwt.id;
  if (req.params && req.params.userId && userId === req.params.userId) {
    return next();
  } else {
    if (user_permission_level & ADMIN) {
      return next();
    } else {
      return res
        .status(403)
        .send({ error: "Permission not granted and not same user" });
    }
  }
};

exports.sameUserCantDoThisAction = (req, res, next) => {
  let userId = req.jwt.userId;

  if (req.params.userId !== userId) {
    return next();
  } else {
    return res.status(403).send({ error: "Not same user" });
  }
};
