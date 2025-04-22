const express = require("express");
const tasks = require("./tasks.router");

const ROOT_ROUTE = "/tasks";

const router = new express.Router();

router.use(ROOT_ROUTE, tasks);

module.exports = router;
module.exports.route = ROOT_ROUTE;
