"use strict";

const mongoose = require("mongoose");
const chalk = require("chalk");
const dayjs = require("dayjs");

const dbClient = require("../src/db/mongoose");
const User = require("../src/models/User");
const Encryption = require("../src/modules/encryption");

class SuperadminSeed {
  static getData() {
    const nowDateTime = dayjs().format();
    return [
      {
        name: "Super Admin",
        email: "krlos2290@gmail.com",
        isSuperAdmin: true,
        password: Encryption.hash("123queso"),
        age: 29,
        confirmedAt: nowDateTime,
        createdAt: nowDateTime,
        updatedAt: nowDateTime,
      },
    ];
  }
  static async up() {
    const data = SuperadminSeed.getData();
    const errorOrInserts = await new Promise((resolve, reject) => {
      User.insertMany(data, (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      });
    }).catch((err) => err);
    if (errorOrInserts instanceof Error) {
      console.log(chalk.red("Failed inserting Users:"), errorOrInserts);
    } else {
      console.log(
        chalk.green(
          `Users Seed successfully inserted ${errorOrInserts.length} records.`
        )
      );
    }
  }
}

module.exports.up = async function (next) {
  await dbClient
    .then(async () => {
      await SuperadminSeed.up();
      return true;
    })
    .then(() => {
      mongoose.connection.close();
    })
    .catch((error) => {
      console.log(chalk.red.inverse("ERROR CONNECTING TO DB"), error);
      mongoose.connection.close();
    });
  next();
};

module.exports.down = async function (next) {
  // await dbClient
  //   .then(() => {
  //     return User.deleteMany({ isSuperAdmin: true, email: 'krlos2290@gmail.com' })
  //   })
  //   .then(() => {
  //     mongoose.connection.close();
  //   })
  //   .catch((error) => {
  //     console.log(chalk.red.inverse("ERROR CONNECTING TO DB"), error);
  //     mongoose.connection.close();
  //   });
  next();
};
