const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  // Default browser behaviour: sends an OPTIONS request before the actual request
  if (req.method === "OPTIONS") return next(); // Just let it pass

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) throw Error("Authorization failed!");

    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError(`Authorization failed: ${err.message}`, 403));
  }
};
