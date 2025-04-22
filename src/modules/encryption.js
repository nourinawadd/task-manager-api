const bcrypt = require("bcryptjs");

class Encryption {
  static hash(text) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(text, salt);
  }
  static isValid(text, hash) {
    return bcrypt.compareSync(text, hash);
  }
}

module.exports = Encryption;
