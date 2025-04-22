const express = require("express");
const { setMiddlewareErrorHandler, setMiddlewareMustBeLoggedIn } = require("../../middlewares");

const { login, sendConfirmationToken, confirm, logoutSession, logoutAllSessions } = require("./account.controller");
const { setMiddlewareEmail, setMiddlewareToken } = require("./account.middleware");

const account = new express.Router();

account.post("/login", login);

account.get("/confirmation", setMiddlewareToken, confirm);

account.post("/confirmation", setMiddlewareEmail, sendConfirmationToken);

account.post("/logout", setMiddlewareMustBeLoggedIn, logoutSession);

account.post("/logout/all", setMiddlewareMustBeLoggedIn, logoutAllSessions);

account.patch("/confirmation", setMiddlewareToken, confirm);

account.all('*', setMiddlewareErrorHandler);

module.exports = account;