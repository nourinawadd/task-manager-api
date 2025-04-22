const setMiddlewareMaintenanceMode = require("./setMiddlewareMaintenanceMode");
const setMiddlewareAuthentication = require("./setMiddlewareAuthentication");
const setMiddlewareAuthorization = require("./setMiddlewareAuthorization");
const setMiddlewareMustBeLoggedIn = require("./setMiddlewareMustBeLoggedIn");
const setMiddlewareErrorHandler = require("./setMiddlewareErrorHandler");
const setMiddlewareLogger = require("./setMiddlewareLogger");

module.exports = {
  setMiddlewareMaintenanceMode,
  setMiddlewareAuthentication,
  setMiddlewareAuthorization,
  setMiddlewareMustBeLoggedIn,
  setMiddlewareErrorHandler,
  setMiddlewareLogger
};
