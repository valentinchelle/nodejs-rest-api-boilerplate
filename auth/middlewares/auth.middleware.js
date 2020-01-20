const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.verifyRefreshBodyField = (req, res, next) => {
  console.log("verifying refresh token");
  if (req.body && req.body.refresh_token) {
    return next();
  } else {
    return res.status(400).send({ error: "Need to pass refresh_token field" });
  }
};

exports.validRefreshNeeded = (req, res, next) => {
  let b = new Buffer(req.body.refresh_token, "base64");
  let refresh_token = b.toString();
  let hash = crypto
    .createHmac("sha512", req.jwt.refreshKey)
    .update(req.jwt.userId + process.env.JWT_SECRET)
    .digest("base64");
  if (hash === refresh_token) {
    req.body = req.jwt;
    return next();
  } else {
    return res.status(400).send({ error: "Invalid refresh token" });
  }
};

exports.validJWTNeeded = (req, res, next) => {
  console.log(req.headers["authorization"]);
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        return res.status(403).send();
      } else {
        console.log("Verifying jwt");
        req.jwt = jwt.verify(authorization[1], process.env.JWT_SECRET);
        return next();
      }
    } catch (err) {
      console.log(err);
      return res.status(403).send();
    }
  } else {
    return res.status(403).send();
  }
};
