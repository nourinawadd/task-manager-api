require("../models/Permission");
const Role = require("../models/Role");

const { skipRoutes } = require("../modules/constants");

const { UnauthorizedError, ForbiddenError } = require("../errors/HttpError");

async function setMiddlewareAuthorization(req, res, next) {
  const { path, method, user } = req;
  const { isSuperAdmin, roles = [] } = user || {};

  req.isSuperAdmin = isSuperAdmin || false;
  req.userRoles = roles;

  // SKIP GENERIC PATHS
  const skip = skipRoutes[path];
  if (skip) {
    const methodName = method.toLowerCase();
    if (skip[methodName]) {
      return next();
    }
  }

  const rolesIds = roles.map((role) => {
    return role.id;
  });

  if (!user && !rolesIds.length) {
    return next(new UnauthorizedError());
  }

  // Superadmin free access
  if (isSuperAdmin) return next();

  Role.find({ _id: { $in: rolesIds } }, { name: 1, permissions: 1 })
    .populate({ path: "permissions", match: { active: true, method } })
    .then((rolePermissions) => {
      if (!rolePermissions.length) {
        throw new ForbiddenError("No role was added to the current user.");
      }
      const pathParts = path.split("/");
      const hasAccess = rolePermissions.find((role) => {
        const { permissions = [] } = role;
        return permissions.find((item) => {
          const parts = item.path.split("/");
          let isValid = false;
          if (parts.length === pathParts.length && parts.length > 0) {
            let i = 0;
            let pathMatchCounter = 0;
            while (i < parts.length) {
              if (parts[i].startsWith(":") && !!pathParts[i]) {
                pathMatchCounter++;
              } else if (parts[i] === pathParts[i]) {
                pathMatchCounter++;
              }
              i++;
            }
            if (pathMatchCounter === pathParts.length) {
              isValid = true;
            }
          }
          return isValid;
        });
      });
      if (!hasAccess) {
        throw new ForbiddenError();
      }
      next();
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = setMiddlewareAuthorization;
