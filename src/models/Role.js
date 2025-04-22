const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const { Schema, model, Types } = mongoose;

const Role = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  permissions: [
    {
      type: Types.ObjectId,
      ref: "Permission",
    },
  ],
});

Role.plugin(timestamps);

Role.method("toClient", (record) => {
  const obj = record.toObject();
  // Rename fields
  obj.id = obj._id;
  return obj;
});

// https://github.com/Automattic/mongoose/issues/1251
let instance;

try {
  // http://mongoosejs.com/docs/api.html#index_Mongoose-model
  instance = model("Role", Role, "role");
} catch (error) {
  instance = model("Role");
}

module.exports = instance;
