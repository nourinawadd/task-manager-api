const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");

const { Schema, model, Types } = mongoose;

const Task = new Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  deletedAt: Date,
});

Task.plugin(timestamps);

Task.methods.toJSON = function () {
  const task = this.toObject();
  delete task.deletedAt;
  return task;
};
Task.method("toClient", (record) => {
  const obj = record.toObject();
  // Rename fields
  obj.id = obj._id;
  return obj;
});

// https://github.com/Automattic/mongoose/issues/1251
let instance;

try {
  // http://mongoosejs.com/docs/api.html#index_Mongoose-model
  instance = model("Task", Task, "task");
} catch (error) {
  instance = model("Task");
}

module.exports = instance;
