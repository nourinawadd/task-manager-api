const migrate = require("migrate");
require("dotenv").config();

const command = process.argv[2];

migrate.load(
  {
    stateStore: ".migrate",
  },
  function (err, set) {
    if (err) {
      throw err;
    }
    if (command === "up") {
      set.up(function (err) {
        if (err) {
          throw err;
        }
        console.log("migrations successfully ran");
      });
    } else if (command === "down") {
      set.down(function (err) {
        if (err) {
          throw err;
        }
        console.log("migrations successfully ran");
      });
    }
  }
);
