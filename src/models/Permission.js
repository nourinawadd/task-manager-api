const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const { Schema, model } = mongoose;

const Permission = new Schema({
  name: {
    type: String,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  method: {
    type: String,
    enum: ["get", "post", "patch", "put", "delete"],
    required: true,
    trim: true,
    lowercase: true,
  },
  path: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

Permission.plugin(timestamps);

Permission.method("toClient", (record) => {
  const obj = record.toObject();
  // Rename fields
  obj.id = obj._id;
  return obj;
});

// https://github.com/Automattic/mongoose/issues/1251
let instance;

try {
  // http://mongoosejs.com/docs/api.html#index_Mongoose-model
  instance = model("Permission", Permission, "permission");
} catch (error) {
  instance = model("Permission");
}

module.exports = instance;
