const express = require("express");
const users = require("./users.router");

const ROOT_ROUTE = "/users";

const router = new express.Router();

router.use(ROOT_ROUTE, users);

module.exports = router;
module.exports.route = ROOT_ROUTE;
