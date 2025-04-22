const sharp = require("sharp");
const { BadRequestError, HttpError } = require("../../errors/HttpError");

module.exports.uploadAvatar = async (req, res, next) => {
  const { logger = console, files = [], user } = req;
  const section = "uploads.controller.uploadAvatar";

  logger.info(`${section} - Starting`);

  const [avatarImg] = files || [];
  if (!avatarImg) {
    return next(new BadRequestError("Please upload an image."));
  }
  const isNew = !user.avatar;
  sharp(avatarImg.buffer)
    .resize({ width: 250, height: 350 })
    .png()
    .toBuffer()
    .then((buffer) => {
      user.avatar = buffer;
      user.save();
    })
    .then(() => {
      logger.info(`${section} - Finishing`);
      res.status(isNew ? 201 : 200).send();
    })
    .catch((error) => {
      logger.info(`${section} - Error`);
      next(new HttpError(error.message));
    });
};

module.exports.deleteAvatar = (req, res, next) => {
  const { logger = console, user } = req;
  const section = "uploads.controller.deleteAvatar";

  logger.info(`${section} - Starting`);

  user.avatar = undefined;
  user
    .save()
    .then(() => {
      logger.info(`${section} - Finishing`);
      res.send();
    })
    .catch((error) => {
      logger.error(`${section} - Error`);
      return next(new HttpError(error.message));
    });
};
