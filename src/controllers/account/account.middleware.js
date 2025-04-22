const { BadRequestError } = require("../../errors/HttpError");

module.exports.setMiddlewareEmail = (req, res, next) => {
  const { body } = req;
  const { email } = body || {};
  req.email = email || "";
  if (!email) {
    return next(new BadRequestError("Missing 'email' parameter"));
  }
  next();
};

module.exports.setMiddlewareToken = (req, _, next) => {
  const { body, query } = req;
  const token = body.token || query.token || '';
  req.token = token || "";
  if (!token) {
    return next(new BadRequestError("Missing 'token' parameter"));
  }
  next();
};
