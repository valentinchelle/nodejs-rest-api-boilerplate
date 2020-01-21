const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
exports.verifyRefreshBodyField = (req, res, next) => {
  console.log("[i] Verifying refresh token");
  if (req.body && req.body.refresh_token) {
    return next();
  } else {
    return res.status(400).send({ error: "Need to pass refresh_token field" });
  }
};

exports.validRefreshNeeded = (req, res, next) => {
  // We get the refresh token provided by the user
  var refresh_token = req.body.refresh_token;

  // We use bcrypt to compare the hash with req.jwt.userId + process.env.JWT_SECRET
  bcrypt.compare(
    req.jwt.userId + process.env.JWT_SECRET,
    refresh_token,
    function(err, res) {
      if (err) {
        return res.status(400).send({ error: "Invalid refresh token" });
      } else {
        req.body = req.jwt;
        return next();
      }
    }
  );
};

// WARNING : The following doesnt verify the jwt. Just verifies its existence.
exports.JwtNeeded = (req, res, next) => {
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        return res.status(403).send();
      } else {
        req.jwt = jwt.decode(authorization[1]);
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

exports.validJWTNeeded = (req, res, next) => {
  console.log(req.headers["authorization"]);
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        return res.status(403).send();
      } else {
        console.log("[i] Verifying jwt");
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
