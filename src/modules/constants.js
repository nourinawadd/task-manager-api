const ACTIONS = {
  GET: "get",
  POST: "post",
  PATCH: "patch",
  PUT: "put",
  DELETE: "delete",
};

module.exports.ACTIONS = ACTIONS;
module.exports.VERBS = Object.values(ACTIONS);

const skipRoutes = {
  "/account/login": {
    [ACTIONS.POST]: true,
  },
  "/account/logout": {
    [ACTIONS.POST]: true,
  },
  "/account/logout/all": {
    [ACTIONS.POST]: true,
  },
  "/account/confirmation": {
    [ACTIONS.GET]: true,
    [ACTIONS.POST]: true,
    [ACTIONS.PATCH]: true,
  },
  "/users/me": {
    [ACTIONS.GET]: true,
    [ACTIONS.PATCH]: true,
    [ACTIONS.DELETE]: true,
  },
  "/users/me/avatar": {
    [ACTIONS.GET]: true,
  },
};

module.exports.skipRoutes = skipRoutes;
