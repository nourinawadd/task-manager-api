const express = require("express");
const { setMiddlewareMustBeLoggedIn } = require("../../middlewares");
const { sendMail } = require("../../service/mail");

const {
  findUsers,
  findOneUser,
  createUser,
  updateUser,
  removeUser,
  findUserAvatar,
} = require("./users.controller");
const { setMiddlewareUserId } = require("./users.middleware");

const users = new express.Router();

// get All Users
users.get("/", findUsers);

// Get User by Id
users.get("/email", (_, res) => {
  sendMail({
    from: "no-reply-taskmanager@carloszuniga.me",
    to: "krlos2290@gmail.com",
    subject: "testing sendgrid",
    body: "This is a sendgrid test",
  })
    .then(() => {
      res.send({ ok: true });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});
users.get("/me", setMiddlewareUserId, findOneUser);
users.get(
  "/me/avatar",
  setMiddlewareMustBeLoggedIn,
  setMiddlewareUserId,
  findUserAvatar
);
users.get("/:id/avatar", setMiddlewareUserId, findUserAvatar);
users.get("/:id", setMiddlewareUserId, findOneUser);

// Create User
users.post("/", createUser);

// Update User by Id
users.patch("/me", setMiddlewareUserId, updateUser);
users.patch("/:id", setMiddlewareUserId, updateUser);

// Delete user by Id
users.delete("/me", setMiddlewareUserId, removeUser);
users.delete("/:id", setMiddlewareUserId, removeUser);

module.exports = users;
