const jwt = require("jsonwebtoken");

const secret = process.env["JWT_SECRET"] || "secret";
const audience = process.env["JWT_AUDIENCE"] || "urn:audience";
const issuer = process.env["JWT_ISSUER"] || "urn:issuer";
const subject = process.env["JWT_SUBJECT"] || "subject";

class JWT {
  static sign(data, opts = {}) {
    /**
     * expiresIn: Default: 1h. Accepts: 1000, "2 days", "10h", "7d".
     * "120" is equal to "120ms"
     */
    const defaultOptions = { expiresIn: 60 * 60, audience, issuer, subject };
    return jwt.sign(
      data,
      secret,
      Object.assign(defaultOptions, opts)
    );
  }
  static verify(token, verifyOpts = {}) {
    const defaultVerifyOpts = { audience, issuer, subject };
    return jwt.verify(
      token,
      secret,
      Object.assign(defaultVerifyOpts, verifyOpts)
    );
  }
  static decode(token, opts = {}) {
    const defaultOpts = { json: true, complete: false };
    return jwt.decode(token, Object.assign(defaultOpts, opts));
  }
}

module.exports = JWT;
