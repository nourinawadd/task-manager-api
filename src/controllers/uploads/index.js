const express = require("express");
const upload = require("./uploads.router");

const ROOT_ROUTE = "/uploads";

const router = new express.Router();

router.use(ROOT_ROUTE, upload);

module.exports = router;
module.exports.route = ROOT_ROUTE;
