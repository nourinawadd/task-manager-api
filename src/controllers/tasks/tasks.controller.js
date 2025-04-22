const { BadRequestError, HttpError } = require("../../errors/HttpError");
const Task = require("../../models/Task");
const { ParsePagingQuery } = require("../../modules/pagination");
const { WhereQuery } = require("../../modules/queryBuilder");
const { schemasValidation, PaginationSchema } = require("../../modules/schema");

module.exports.findTasks = (req, res, next) => {
  const { logger = console, query, user } = req;
  const search = { deletedAt: null, owner: user._id };
  const section = "tasks.controller.findTasks";

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

  WhereQuery(Task, { ...parsedQueryOrError, ...search })
    .then((payload) => {
      logger.info(`${section} - Finishing`);
      res.send(payload);
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new BadRequestError(error.message));
    });
};

module.exports.findDeletedTasks = (req, res, next) => {
  const { logger = console, query, user } = req;
  const search = { deletedAt: { $ne: null }, owner: user._id };
  const section = "tasks.controller.findDeletedTasks";

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

  WhereQuery(Task, { ...parsedQueryOrError, ...search })
    .then((payload) => {
      logger.info(`${section} - Finishing`);
      res.send(payload);
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new BadRequestError(error.message));
    });
};

module.exports.findOneTask = (req, res, next) => {
  const { logger = console, params } = req;
  const section = "tasks.controller.findOneTask";

  logger.info(`${section} - Starting`);

  Task.findOne({ _id: params.id, deletedAt: null })
    .then((results) => {
      logger.info(`${section} - Finishing`);
      if (!results) {
        res.status(204).send(null);
      } else {
        res.send(results);
      }
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new HttpError(error.message));
    });
};

module.exports.createTask = (req, res, next) => {
  const { logger = console, body } = req;
  const section = "tasks.controller.createTask";

  logger.info(`${section} - Starting`);

  const task = new Task(body);
  task
    .save()
    .then((task) => {
      logger.info(`${section} - Finishing`);
      res.status(201).send(task);
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new BadRequestError(error.message));
    });
};

module.exports.updateTask = (req, res, next) => {
  const { logger = console, body, params } = req;
  const allowedUpdates = ["description", "completed"];
  const section = "tasks.controller.updateTask";
  const updates = Object.keys(body);

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  logger.info(`${section} - Starting`);

  if (!isValidOperation) {
    return next(new BadRequestError("Invalid updates!"));
  }
  Task.findOneAndUpdate({ _id: params.id, deletedAt: null }, body, {
    new: true,
    runValidators: true,
  })
    .then((task) => {
      logger.info(`${section} - Finishing`);
      if (!task) {
        res.status(204).send(null);
      } else {
        res.send(task);
      }
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new HttpError(error.message));
    });
};

module.exports.removeTask = (req, res, next) => {
  const { logger = console, params } = req;
  const section = "tasks.controller.removeTask";

  logger.info(`${section} - Starting`);

  Task.findOneAndUpdate(
    { _id: params.id, deletedAt: null },
    { deletedAt: Date.now() },
    { new: true, runValidators: true }
  )
    .then((task) => {
      logger.info(`${section} - Finishing`);
      if (!task) {
        res.status(204).send(null);
      } else {
        res.status(200).send(task);
      }
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new HttpError(error.message));
    });
};
