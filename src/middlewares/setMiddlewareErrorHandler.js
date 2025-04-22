const setMiddlewareErrorHandler = (err, req, res, next) => {
  const { statusCode = 500, message = "Server error", meta, error } = err;
  const errorMessage = error || {
    message,
    statusCode,
    meta,
  };

  console.error(`ERROR: ${JSON.stringify(errorMessage)}`);

  res.status(statusCode).send(errorMessage);
};

module.exports = setMiddlewareErrorHandler;
