function jsonParamParser(name, query) {
  const stringValue = query[name] || "{}";

  if (name !== "filter" && typeof stringValue !== "string") return stringValue;

  if (name === "filter" && stringValue !== '{}') {
    Object.keys(stringValue).forEach((key) => {
      stringValue[key] = JSON.parse(stringValue[key]);
    });
    return stringValue;
  }
  const jsonValue = JSON.parse(stringValue);

  return jsonValue;
}

module.exports.ParsePagingQuery = function ParsePagingQuery(query) {
  const page = query.page || "1";
  const pageSize = query.pageSize || "10";
  const order = query.order || "desc";
  const orderBy = query.orderBy || undefined;
  const search = jsonParamParser("search", query);
  const filter = jsonParamParser("filter", query);
  const searchIn = jsonParamParser("searchIn", query);
  const lowerThan = jsonParamParser("lowerThan", query);
  const lowerEqThan = jsonParamParser("lowerEqThan", query);
  const greaterThan = jsonParamParser("greaterThan", query);
  const greaterEqThan = jsonParamParser("greaterEqThan", query);

  const pageInt = parseInt(page, 10);
  const pageSizeInt = parseInt(pageSize, 10);

  if (pageInt < 0) return new HttpError("Bad page format", 400);

  if (pageSizeInt < 0) return new HttpError("Bad pageSize format", 400);

  return {
    ...query,
    page: pageInt,
    pageSize: pageSizeInt,
    order,
    orderBy,
    search,
    filter,
    searchIn,
    lowerThan,
    lowerEqThan,
    greaterThan,
    greaterEqThan,
  };
};
