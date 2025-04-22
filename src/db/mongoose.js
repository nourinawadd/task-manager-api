const mongoose = require("mongoose");

const client = mongoose.connect(process.env.MONGO_DB_CONN_STRING, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

module.exports = client;
