const { NotFoundError, HttpError } = require("../../errors/HttpError");
const Task = require("../../models/Task");

module.exports.setMiddlewareAddOwner = (req, _, next) => {
  const { body, user } = req;
  body.owner = user._id;

  next();
};

module.exports.setMiddlewareValidateOwner = (req, _, next) => {
  const { params, user, isSuperAdmin } = req;
  const { id } = params || {};
  const { _id: userId } = user || {};

  if (!id) return next(new NotFoundError());

  if (isSuperAdmin) return next();

  Task.countDocuments({ _id: id, owner: userId })
    .then((found) => {
      if (found > 0) return next();
      next(new NotFoundError());
    })
    .catch((error) => {
      console.log(error);
      next(new NotFoundError());
    });
};

module.exports.setMiddlewareRestoreTask = (req, _, next) => {
  const { params } = req;
  const { id } = params || {};

  Task.updateOne({ _id: id }, { deletedAt: null })
    .then(() => {
      next();
    })
    .catch((error) => {
      next(new HttpError(error.message));
    });
};
