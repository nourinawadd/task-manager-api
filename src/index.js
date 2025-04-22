const express = require("express");
const chalk = require("chalk");
require("dotenv").config();

// DB Connection
require("./db/mongoose");
const setRoutes = require("./controllers/index");
const {
  setMiddlewareMaintenanceMode,
  setMiddlewareLogger,
  setMiddlewareAuthentication,
  setMiddlewareAuthorization,
  setMiddlewareErrorHandler,
} = require("./middlewares");
const { NotFoundError } = require("./errors/HttpError");

// Express Setup
const app = express();
app.use(express.json());

// Listining Port
const port = process.env.PORT || 3000;

const setMiddlewares = (app) => {
  app.use([
    setMiddlewareMaintenanceMode,
    setMiddlewareLogger,
    setMiddlewareAuthentication,
    setMiddlewareAuthorization,
  ]);
};

// middlewares
setMiddlewares(app);
app.charlieMark = true;
// Add Routes
setRoutes(app);

const notFoundHandler = (req, _, next) => {
  next(new NotFoundError(`${req.originalUrl} not found`));
};
app.use(notFoundHandler);

app.use(setMiddlewareErrorHandler);

app.listen(port, () =>
  console.log(chalk.green.inverse(`🚀 Server running on port ${port}`))
);
