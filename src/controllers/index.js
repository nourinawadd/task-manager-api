const chalk = require("chalk");

const usersController = require("./users");
const tasksController = require("./tasks");
const accountController = require("./account");
const uploadController = require("./uploads");

const routes = [
  usersController,
  tasksController,
  accountController,
  uploadController,
];

function setRoutes(app) {
  const controllers = routes.map((item) => item.route);

  app.use(routes);

  console.log(chalk.blue(`Routers:\n -${controllers.join("\n -")}`));
}

module.exports = (app) => setRoutes(app);
