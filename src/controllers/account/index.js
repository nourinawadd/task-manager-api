const express = require("express");
const account = require("./account.router");

const ROOT_ROUTE = "/account";

const router = new express.Router();

router.use(ROOT_ROUTE, account);

module.exports = router;
module.exports.route = ROOT_ROUTE;
