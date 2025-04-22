module.exports.WhereQuery = (entity, queryParams, projection) => {
  return new Promise((resolve, reject) => {
    const {
      page,
      pageSize,
      order,
      orderBy,
      search,
      filter,
      searchIn,
      lowerThan,
      lowerEqThan,
      greaterThan,
      greaterEqThan,
      ...custom
    } = queryParams;
    const conditions = custom || {};

    let queryBuilder = entity;

    if (Object.keys(search).length) {
      Object.keys(search).forEach((field) => {
        conditions[field] = {
          $regex: `.*${search[field]}*`,
          $options: "is",
        };
      });
    }

    if (Object.keys(searchIn).length) {
      const keys = Object.keys(searchIn);
      keys.forEach((key) => {
        conditions[key] = { $in: searchIn[key] };
      });
    }

    if (Object.keys(filter).length) {
      const keys = Object.keys(filter);
      keys.forEach((key) => {
        conditions[key] = filter[key];
      });
    }

    if (Object.keys(lowerThan).length) {
      const keys = Object.keys(lowerThan);
      keys.forEach((key) => {
        conditions[key] = { $lt: lowerThan[key] };
      });
    }

    if (Object.keys(lowerEqThan).length) {
      const keys = Object.keys(lowerEqThan);
      keys.forEach((key) => {
        conditions[key] = { $lte: lowerEqThan[key] };
      });
    }

    if (Object.keys(greaterThan).length) {
      const keys = Object.keys(greaterThan);
      keys.forEach((key) => {
        conditions[key] = { $gt: greaterThan[key] };
      });
    }

    if (Object.keys(greaterEqThan).length) {
      const keys = Object.keys(greaterEqThan);
      keys.forEach((key) => {
        conditions[key] = { $gte: greaterEqThan[key] };
      });
    }

    queryBuilder = queryBuilder.where(conditions);
    const countQuery = entity.find().merge(queryBuilder);

    if (projection) {
      queryBuilder.projection(projection);
    }

    if (pageSize) {
      queryBuilder.limit(pageSize);
    }

    if (page > 1) {
      queryBuilder.skip(pageSize * (page - 1));
    }

    if (orderBy) {
      queryBuilder.sort({ [orderBy]: order.toLowerCase() === "asc" ? 1 : -1 });
    }

    Promise.all([countQuery.countDocuments(), queryBuilder.find()])
      .then((responses) => {
        const [total, data] = responses;
        const totalPages = Math.ceil(total / pageSize);
        resolve({
          total,
          data,
          meta: {
            page,
            pageSize,
            order,
            orderBy: orderBy || '',
            totalPages,
          },
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
