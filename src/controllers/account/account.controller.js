const os = require("os");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const mongoose = require("mongoose");

const JWT = require("../../modules/jwt");
const User = require("../../models/User");
const { sendMail, strigTags } = require("../../service/mail");
const {
  UnauthorizedError,
  BadRequestError,
  HttpError,
} = require("../../errors/HttpError");

dayjs.extend(utc);

module.exports.login = (req, res) => {
  const { logger = console, body } = req;
  const section = "account@login";
  const DEFAULT_ERROR_MESSAGE = "Invalid user and/or password";

  logger.info(`${section} - Starting`);

  const { email: emailInput, password: passwordInput } = body;

  const email = `${emailInput}`.trim();
  const password = `${passwordInput}`.trim();

  if (!email || !password) {
    return next(new UnauthorizedError(DEFAULT_ERROR_MESSAGE));
  }
  const sessionId = new mongoose.Types.ObjectId().toString();
  User.findByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new Error(DEFAULT_ERROR_MESSAGE);
      }
      const networkInterfaces = os.networkInterfaces() || {};
      const ip = networkInterfaces.hasOwnProperty("lo")
        ? networkInterfaces.lo.find(
            (ip) =>
              ip.internal === false &&
              `${ip.family || ""}`.toLowerCase() === "ipv4"
          )
        : "";
      const session = {
        sessionId,
        architecture: os.arch(),
        hostname: os.hostname(),
        ip,
        platform: os.platform(),
        release: os.release(),
        ostype: os.type(),
        userInfo: os.userInfo(),
      };
      if (user.sessions.length > 0) {
        user.sessions = user.sessions.slice(-3);
      } else {
        user.sessions = [];
      }
      user.sessions.push(session);
      return user.save();
    })
    .then((entity) => {
      logger.info(`${section} - Finishing`);
      const user = entity.toJSON();
      const expiresIn = 60 * 60; // 1 hr
      const expiration = dayjs().add(expiresIn, "second").utc().format();
      res.send({
        token: {
          accessToken: JWT.sign({ sessionId }, { expiresIn }),
          expiresIn,
          expiration,
        },
        user,
      });
    })
    .catch((error) => {
      logger.error(`${section} - Error: ${error.message}`);
      return next(new UnauthorizedError(DEFAULT_ERROR_MESSAGE));
    });
};

module.exports.sendConfirmationToken = (req, res, next) => {
  const { logger = console, email } = req;
  const section = "account@sendConfirmationToken";

  logger.info(`${section} - Starting`);

  if (!email) return next(new BadRequestError({ error: "Missing parameters" }));

  User.findOne({ email })
    .then((user) => {
      if (!user) throw new Error(`User not found with email ${email}`);
      if (user.confirmedAt) {
        return user;
      }

      user.generateConfirmationToken();

      return user.save();
    })
    .then((user) => {
      if (user.confirmedAt) {
        return user;
      }
      const url = user.getConfirmationLink();
      const body = `Please confirm your account here: ${url}`;
      return sendMail({
        to: user.email,
        subject: "Confirm your account",
        body,
        text: strigTags(body),
      });
    })
    .then(() => {
      logger.info(`${section} - Finishing`);
      res.send({ sent: true });
    })
    .catch((error) => {
      logger.error(`${section} - Error: ${error.message}\n${error.stack}`);
      res.send({ sent: true });
    });
};

module.exports.confirm = (req, res, next) => {
  const { logger = console, token = "" } = req;
  const section = "account.controller.confirm";
  const DEFAULT_ERROR_MESSAGE = "Invalid or expired token";

  logger.info(`${section} - Starting`);

  if (!token) {
    return next(new BadRequestError(DEFAULT_ERROR_MESSAGE));
  }
  const isValid = JWT.verify(token);
  const { confirmationToken, exp: expiresIn } = isValid || {};

  if (!isValid || !confirmationToken) {
    return next(new BadRequestError(DEFAULT_ERROR_MESSAGE));
  }

  User.findOne({ confirmationToken })
    .then((user) => {
      if (!user) throw new Error(DEFAULT_ERROR_MESSAGE);
      if (user.confirmedAt) return true;

      const expirationToken = user.confirmationTokenExpireAt
        ? dayjs(user.confirmationTokenExpireAt).startOf("minute")
        : null;

      if (!expirationToken) throw new Error(DEFAULT_ERROR_MESSAGE);

      const tokenExpiresIn = dayjs(expiresIn * 1000).startOf("minute");

      if (!expirationToken.isSame(tokenExpiresIn)) {
        throw new Error(DEFAULT_ERROR_MESSAGE);
      }

      user.confirmedAt = dayjs().utc().format();

      return user.save();
    })
    .then(() => {
      logger.info(`${section} - Finishing`);
      res.send({ confirmed: true });
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      next(new BadRequestError(error.message));
    });
};

module.exports.logoutSession = (req, res, next) => {
  const { logger = console, user, sessionId } = req;
  const section = "account.controller.logoutSession";

  logger.info(`${section} - Starting`);

  user.sessions = user.sessions.filter(
    (session) => sessionId !== session.sessionId
  );
  user
    .save()
    .then(() => {
      logger.info(`${section} - Finishing`);
      res.send({ loggedOut: true });
    })
    .catch((error) => {
      logger.error(
        `${section} - Error: Unable to logout user session. ${error.message}`
      );
      console.log(
        chalk.red.inverse("Unable to logout user session:"),
        chalk.red(error.message)
      );
      next(new HttpError("Unable to logout your session"));
    });
};

module.exports.logoutAllSessions = (req, res) => {
  const { logger = console, user } = req;
  const section = "account.controller.logoutAllSessions";

  logger.info(`${section} - Starting`);

  user.sessions = [];
  user
    .save()
    .then(() => {
      logger.info(`${section} - Finishing`);
      res.send({ loggedOut: true });
    })
    .catch((error) => {
      logger.error(
        `${section} - Error: Unable to logout user from ALL sessions. ${error.message}`
      );
      console.log(
        chalk.red.inverse("Unable to logout user from ALL sessions:"),
        chalk.red(error.message)
      );
      next(new HttpError("Unable to logout ALL of your sessions"));
    });
};
