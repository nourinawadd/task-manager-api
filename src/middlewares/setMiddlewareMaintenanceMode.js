const bMaintenance = process.env["MAINTENANCE_MODE"] || "";

const underMaintenance =
  ["on", "1", "true"].indexOf(bMaintenance) !== -1 || false;

const setMiddlewareMaintenanceMode = (_, res, next) =>
  underMaintenance
    ? res.send("API is down. Currently under maintenance. Check back soon!")
    : next();

module.exports = setMiddlewareMaintenanceMode;
