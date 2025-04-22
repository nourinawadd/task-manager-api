const {
  BadRequestError,
  UnauthorizedError,
} = require("../../errors/HttpError");

module.exports.setMiddlewareUserId = (req, res, next) => {
  const { params, user, path } = req;
  if (params.id) {
    req.currentUser = false;
    req.id = params.id;
    next();
  } else if (path.startsWith("/me")) {
    if (!user) return next(new UnauthorizedError());

    req.currentUser = true;
    req.id = user._id.toString();
    next();
  } else {
    next(new BadRequestError("Missing 'id' parameter"));
  }
};
