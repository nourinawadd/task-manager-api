const winston = require("winston");
const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");

const setMiddlewareLogger = (req, _, next) => {
  const transactionId = uuidv4();
  req.transactionId = transactionId;

  const environment = process.env.NODE_ENVIRONMENT;
  const logLevel = process.env.LOG_LEVEL;

  if (!environment) throw new Error("NODE_ENVIRONMENT' variable required.");
  if (!logLevel) throw new Error("'LOG_LEVEL' variable required.");

  const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.json(),
    defaultMeta: { transactionId, dateTime: dayjs().format() },
    transports: [
      new winston.transports.File({
        filename: `logs/${environment}.log`,
        // level: logLevel,
      }),
      // new winston.transports.File({ filename: "logs/combined.log" }),
    ],
  });

  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      })
    );
  }

  req.logger = logger;

  logger.info(`${req.method} ${req.url}`);

  next();
};

module.exports = setMiddlewareLogger;
