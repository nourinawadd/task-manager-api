const express = require("express");

const { setMiddlewareMustBeLoggedIn } = require("../../middlewares");
const { setMiddlewareUploadName } = require("./uploads.middleware");

const { uploadAvatar, deleteAvatar } = require("./uploads.controller");
const { ProfileOpts } = require("./uploads.settings");

const uploads = new express.Router();

// get All Users
uploads.post(
  "/avatar",
  setMiddlewareMustBeLoggedIn,
  setMiddlewareUploadName(ProfileOpts),
  uploadAvatar
);

uploads.delete('/avatar', setMiddlewareMustBeLoggedIn, deleteAvatar);

module.exports = uploads;
