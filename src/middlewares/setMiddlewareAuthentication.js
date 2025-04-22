const JWT = require("../modules/jwt");
const User = require("../models/User");
const { UnauthorizedError } = require("../errors/HttpError");

const JWT_ERRORS = ['TokenExpiredError','JsonWebTokenError', 'NotBeforeError'];

const setMiddlewareAuthentication = (req, res, next) => {
  const DEFAULT_ERROR_MESSAGE = "You must be logged in!";
  let valid;
  try {
    const token = req.header("Authorization");
    if (token) {
      valid = JWT.verify(token.replace("Bearer ", ""));
      if (!valid) {
        throw new UnauthorizedError(DEFAULT_ERROR_MESSAGE);
      }
    }
  } catch (error) {
    const { name = '' } = error;
    if (name && JWT_ERRORS.indexOf(name) !== -1) {
      return next(new UnauthorizedError(error.name));
    }
    return next(error);
  }
  const { sessionId } = valid || {};
  if (sessionId) {
    User.findOne({ "sessions.sessionId": sessionId })
      .populate("roles")
      .then((user) => {
        if (!user) {
          throw new Error(DEFAULT_ERROR_MESSAGE);
        }
        // Setup Session ID and user into req
        req.sessionId = sessionId;
        req.user = user;
        next();
      })
      .catch(() => {
        return res.status(401).send({ error: DEFAULT_ERROR_MESSAGE });
      });
  } else {
    next();
  }
};

module.exports = setMiddlewareAuthentication;
