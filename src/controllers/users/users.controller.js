const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const {
  HttpError,
  NotFoundError,
  BadRequestError,
} = require("../../errors/HttpError");

const User = require("../../models/User");
const { ParsePagingQuery } = require("../../modules/pagination");
const { WhereQuery } = require("../../modules/queryBuilder");
const { schemasValidation } = require("../../modules/schema");
const {
  getWelcomeTemplateOpts,
  sendMail,
  getCancelationTemplateOpts,
} = require("../../service/mail");

dayjs.extend(utc);

module.exports.findUsers = (req, res, next) => {
  const { logger = console, query, user } = req;
  const section = "users.controller.findUsers";
  const search = {
    deletedAt: null,
    isSuperAdmin: false,
    _id: { $ne: user._id },
  };

  logger.info(`${section} - Starting`);

  const parsedQueryOrError = ParsePagingQuery(query);

  if (parsedQueryOrError instanceof Error) {
    return next(parsedQueryOrError);
  }

  const validationErrors = schemasValidation(
    PaginationSchema,
    parsedQueryOrError
  );
  if (validationErrors) {
    return next(validationErrors);
  }

  WhereQuery(User, { ...parsedQueryOrError, ...search })
    .then((response) => {
      logger.info(`${section} - Finishing`);
      res.send(response);
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new BadRequestError(error.message));
    });
};

module.exports.findOneUser = (req, res, next) => {
  const { logger = console, currentUser, user } = req;
  const section = "users.controller.findOneUser";

  logger.info(`${section} - Starting`);

  if (currentUser) return res.send(user);

  User.findOne({ _id: req.id, deletedAt: null })
    .then((result) => {
      logger.info(`${section} - Finishing`);
      if (!result) {
        res.status(204).send(null);
      } else {
        res.send(result);
      }
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new HttpError(error.message));
    });
};

// Create User
module.exports.createUser = (req, res, next) => {
  const { logger = console, body } = req;
  const section = "users.controller.createUser";

  logger.info(`${section} - Starting`);

  const user = new User(body);

  user.generateConfirmationToken();

  user
    .save()
    .then(() => {
      logger.info(`${section} - Sending email`);

      const confirmationUrl = user.getConfirmationLink();

      const emailTemplateOpts = getWelcomeTemplateOpts(
        user.email,
        user.name,
        confirmationUrl
      );
      return sendMail(emailTemplateOpts);
    })
    .then(() => {
      logger.info(`${section} - Finishing`);
      res.status(201).send(user);
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new BadRequestError(error.message));
    });
};

module.exports.updateUser = (req, res, next) => {
  const { logger = console, body, id } = req;
  const allowedUpdates = ["name", "age", "password"];
  const section = "users.controller.updateUser";

  logger.info(`${section} - Starting`);

  const updates = Object.keys(body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return next(new BadRequestError("Invalid updates!"));
  }
  User.findOneAndUpdate({ _id: id, deletedAt: null }, body, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      logger.info(`${section} - Finishing`);
      if (!user) {
        res.status(204).send(null);
      } else {
        res.send(user);
      }
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new BadRequestError(error.message));
    });
};

module.exports.removeUser = (req, res, next) => {
  const { logger = console, id } = req;
  const section = "users.controller.removeUser";

  logger.info(`${section} - Starting`);

  User.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: Date.now() },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) throw new NotFoundError("User not found");

      logger.info(`${section} - Sending email`);

      const cancelationOpts = getCancelationTemplateOpts(user.email, user.name);
      const emailPromise = sendMail(cancelationOpts);

      return Promise.all([user, emailPromise]);
    })
    .then((response) => {
      const [user] = response;
      logger.info(`${section} - Finishing`);
      if (!user) {
        res.status(204).send(null);
      } else {
        res.status(200).send(user);
      }
    })
    .catch((error) => {
      if (error instanceof NotFoundError) return next(error);
      logger.error(`${section} - Finishing`);
      next(new BadRequestError(error.message));
    });
};

module.exports.findUserAvatar = (req, res, next) => {
  const { logger = console, id, currentUser, user } = req;
  const section = "users.controller.findUserAvatar";

  logger.info(`${section} - Starting`);

  let promise;
  if (currentUser) {
    promise = Promise.resolve(user);
  } else {
    promise = User.findOne({ _id: id, deletedAt: null });
  }
  promise
    .then((user) => {
      const { avatar } = user;
      if (!avatar) {
        return next(new NotFoundError("Avatar image not found"));
      }
      logger.info(`${section} - Finishing`);
      res.set("Content-Type", "image/png").send(avatar);
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new HttpError(error.message));
    });
};
