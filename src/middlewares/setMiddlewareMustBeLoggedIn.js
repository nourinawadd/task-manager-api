const { UnauthorizedError } = require("../errors/HttpError");

const setMiddlewareMustBeLoggedIn = (req, res, next) => {
  const { user } = req;
  if (!user) return next(new UnauthorizedError("You must be logged in"));
  next();
};

module.exports = setMiddlewareMustBeLoggedIn;
