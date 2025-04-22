/**
 * @typedef {Object} ErrorMetaError
 * @property {String} [identifier]
 * @property {String} [description]
 * @property {String} [entity]
 * @property {[...any]} [args]
 */

/**
 * @typedef {Object} ErrorMeta
 * @property {ErrorMetaError} [errors]
 * @property {[...any]} [args]
 */

// /**
//  * @typedef {Object} HttpError
//  * @property {Number} statusCode Default: 500
//  * @property {String} message
//  * @property {ErrorMeta} meta
//  */
class HttpError extends Error {
  statusCode = 500;
  message = "Internal Server Error";
  meta;

  /**
   *
   * @param {String} message Error message
   * @param {Number} statusCode Http status code
   * @param {ErrorMeta} meta Metadata
   */
  constructor(
    /** @type {String} */
    message,
    /** @type {Number} */
    statusCode = 500,
    /** @type {ErrorMeta} */
    meta
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.meta = meta;
  }
}
module.exports.HttpError = HttpError;

class UnauthorizedError extends HttpError {
  /**
   *
   * @param {string} message Error message
   * @param {ErrorMeta} [meta] Metadata
   */
  constructor(
    /**
     * @type {String}
     * @default Unauthorized
     */
    message = "Unauthorized",
    /** @type {ErrorMeta} */
    meta
  ) {
    super(message, 401, meta);
  }
}
module.exports.UnauthorizedError = UnauthorizedError;

class NotFoundError extends HttpError {
  /**
   *
   * @param {string} message Error message
   * @param {ErrorMeta} [meta] Metadata
   */
  constructor(
    /**
     * @type {String}
     * @default "Not found"
     * */
    message = "Not found",
    /** @type {ErrorMeta} */
    meta
  ) {
    super(message, 404, meta);
  }
}
module.exports.NotFoundError = NotFoundError;

class ForbiddenError extends HttpError {
  /**
   *
   * @param {string} message Error message
   * @param {ErrorMeta} [meta] Metadata
   */
  constructor(
    /**
     * @type {String}
     * @default "Forbidden"
     * */
    message = "Forbidden Access",
    /** @type {ErrorMeta} */
    meta
  ) {
    super(message, 403, meta);
  }
}
module.exports.ForbiddenError = ForbiddenError;

class ConflictError extends HttpError {
  constructor(message = "Conflict", meta) {
    super(message, 409, meta);
  }
}
module.exports.ConflictError = ConflictError;

class BadRequestError extends HttpError {
  /**
   *
   * @param {string} message Error message
   * @param {ErrorMeta} [meta] Metadata
   */
  constructor(
    /**
     * @type {String}
     * @default "Bad request"
     * */
    message = "Bad request",
    /** @type {ErrorMeta} */
    meta
  ) {
    super(message, 400, meta);
  }
}
module.exports.BadRequestError = BadRequestError;
