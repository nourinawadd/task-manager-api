const mongoose = require("mongoose");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timestamps = require("mongoose-timestamp");
const validator = require("validator");

const Encryption = require("../modules/encryption");
const JWT = require("../modules/jwt");
const Task = require("./Task");

dayjs.extend(utc);

const MIN_HOURS_LOCKED = 24; // Minimum of hours account is locked, or recover via email
const MAX_FAILED_ATTEMPTS = 3; // Maximum of failed attempts them account is locked

const { Schema, model, ObjectId, Types } = mongoose;

// https://github.com/Automattic/mongoose/issues/1251
let instance;

const User = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(email) {
      if (!validator.isEmail(email)) {
        throw new Error("Email is invalid.");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(password) {
      if (password.toLowerCase().includes("password")) {
        throw new Error("Password can't contain 'password'");
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(age) {
      if (age < 0) {
        throw new Error("Age must be a positive number.");
      }
    },
  },
  sessions: [
    {
      sessionId: String,
      architecture: String,
      hostname: String,
      ip: String,
      platform: String,
      release: String,
      ostype: String,
      userInfo: mongoose.Mixed,
    },
  ],
  confirmationToken: String,
  confirmationTokenExpireAt: Date,
  confirmationSentAt: Date,
  confirmedAt: Date,
  // Login Failed Attempts
  failedAttempts: {
    type: Number,
    default: 0,
  },
  // Too many failed password attempts since
  lockedAt: Date,
  // Password Recovery
  recoveryToken: String,
  recoveryTokenExpiryAt: Date,
  recoverySentAt: Date,
  // Email confirmed
  confirmedAt: Date,
  signInCount: {
    type: Number,
    default: 0,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  roles: {
    type: [
      {
        type: ObjectId,
        ref: "Role",
      },
    ],
    required: true,
  },
  avatar: {
    type: Buffer,
  },
  deletedAt: Date,
});

User.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

User.plugin(timestamps);

function EncryptPassword(user) {
  if (user.hasOwnProperty("isNew")) {
    if (user.isNew) {
      user.password = Encryption.hash(user.password);
    }
  } else if (user.hasOwnProperty("isModified")) {
    if (user.isModified("password")) {
      user.password = Encryption.hash(user.password);
    }
  } else if (user.hasOwnProperty("_update")) {
    const { password } = user._update;
    if (password) {
      user._update.password = Encryption.hash(password);
    }
  }
}

async function ApplyChangesToNew(next) {
  const user = this;
  try {
    EncryptPassword(user);
  } catch (error) {
    console.log(error);
  }
  next();
}

async function CascadeDeleteTasks(next) {
  const user = this;
  const successOrError = await Task.deleteMany({ owner: user._id }).catch(
    (err) => err
  );
  if (successOrError instanceof Error) return next(successOrError);
  next();
}

User.pre("findOneAndUpdate", ApplyChangesToNew);
User.pre("save", ApplyChangesToNew);
User.pre("remove", CascadeDeleteTasks);

User.methods.generateConfirmationToken = function () {
  const user = this;
  const token = mongoose.Types.ObjectId();
  const now = dayjs.utc();
  user.confirmationToken = token.toHexString();
  user.confirmationSentAt = now.format();
  user.confirmationTokenExpireAt = now.add(30, "day").format();
};

User.methods.getConfirmationLink = function (secondTry = false) {
  const user = this;
  const { confirmationToken, confirmationTokenExpireAt } = user;
  const expiresIn = dayjs(confirmationTokenExpireAt).diff(
    dayjs().utc(),
    "second"
  );
  if (expiresIn < 0 && !secondTry) {
    (async function() {
      user.generateConfirmationToken();
      await user.save();
    })()
    return user.getConfirmationLink(true);
  }

  const token = JWT.sign({ confirmationToken }, { expiresIn });
  const url = `${process.env.ACCOUNT_CONFIRMATION_URL}?token=${token}`;
  return url;
};

User.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.sessions;
  delete user.isSuperAdmin;
  delete user.avatar;
  delete user.confirmationToken;
  delete user.confirmationSentAt;
  delete user.confirmationTokenExpireAt;

  return user;
};

const GENERIC_LOGIN_ERROR = "Invalid user and/or password";
const ACCOUNT_DELETED = "Account deleted";
const ACCOUNT_BLOCKED_ERROR = "Account blocked";
const ACCOUNT_NOT_CONFIRMED = "Account not confirmed";

/**
 * @description Find User by credentails (email and password)
 * @param email User's email
 * @param password User's password
 * @param callback Callback function (Optional)
 * @returns Promise<User>
 */
User.statics.findByCredentials = async (email, password, callback = null) => {
  let user;
  async function updateFailures(err) {
    try {
      if (user) {
        if (err.message === GENERIC_LOGIN_ERROR) {
          if (!user.lockedAt) {
            user.failedAttempts += 1;
            if (user.failedAttempts > MAX_FAILED_ATTEMPTS) {
              user.lockedAt = new Date();
            }
            await user.save();
          }
        }
      }
    } catch (ex) {}
  }
  return instance
    .findOne({
      email,
    })
    .then((userfound) => {
      if (!userfound) {
        throw new Error(GENERIC_LOGIN_ERROR);
      }
      user = userfound;
      if (user.deletedAt) {
        throw new Error(ACCOUNT_DELETED);
      }
      if (user.lockedAt) {
        // If account is locked user should wait 24 hrs to retry, or recover account via email (UI needs to allow user to recover account via email).
        const diff = dayjs().diff(user.lockedAt, "hour");
        if (diff < MIN_HOURS_LOCKED) {
          throw new Error(ACCOUNT_BLOCKED_ERROR);
        }
      }
      const isPasswordValid = Encryption.isValid(password, user.password);

      if (!isPasswordValid) {
        throw new Error(GENERIC_LOGIN_ERROR);
      }
      if (!user.confirmedAt) {
        throw new Error(ACCOUNT_NOT_CONFIRMED);
      }
      if (callback) {
        return Promise.resolve(callback(null, user));
      }
      user.signInCount = user.signInCount + 1;
      return user;
    })
    .catch(async (err) => {
      await updateFailures(err);
      if (callback) {
        return Promise.resolve(callback(err.message, null));
      }
      throw new Error(err.message);
    });
};

User.method("toClient", (record) => {
  const obj = record.toObject();
  // Rename fields
  obj.id = obj._id;
  return obj;
});

try {
  // http://mongoosejs.com/docs/api.html#index_Mongoose-model
  instance = model("User", User, "user");
} catch (error) {
  instance = model("User");
}

module.exports = instance;
