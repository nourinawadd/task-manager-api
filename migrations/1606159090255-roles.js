"use strict";

const mongoose = require("mongoose");
const chalk = require("chalk");

const dbClient = require("../src/db/mongoose");
const { ACTIONS } = require("../src/modules/constants");
const Permission = require("../src/models/Permission");
const Role = require("../src/models/Role");

class RolesSeed {
  static getData() {
    return [
      {
        name: "admin",
        description: "Administrator role",
        mapPermissions: [
          "get_users",
          "get_users_id",
          "post_users",
          "patch_users_id",
          "delete_users_id",
          "get_tasks",
          "post_tasks",
          "patch_tasks_id",
          "delete_tasks_id",
          "get_tasks_deleted"
        ],
      },
      {
        name: "editor",
        description: "Editor role",
        mapPermissions: [
          "get_users",
          "get_users_id",
          "post_users",
          "patch_users_id",
          "get_tasks",
          "post_tasks",
          "patch_tasks_id",
        ],
      },
      {
        name: "User",
        description: "User role",
        mapPermissions: ["get_users", "get_users_id", "get_tasks"],
      },
    ];
  }
  static async up() {
    const initialData = RolesSeed.getData();
    const permissionsOrError = await Permission.find({}, { _id: 1, name: 1 });
    if (permissionsOrError instanceof Error) {
      throw permissionsOrError;
    }
    const data = initialData.map((item) => ({
      name: item.name,
      description: item.description,
      permissions: permissionsOrError.filter(
        (grant) => item.mapPermissions.indexOf(grant.name) !== -1
      ).map(grant => grant._id),
    }));
    const errorOrInserts = await new Promise((resolve, reject) => {
      Role.insertMany(data, (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      });
    }).catch((err) => err);
    if (errorOrInserts instanceof Error) {
      console.log(chalk.red("Failed inserting Roles:"), errorOrInserts);
    } else {
      console.log(
        chalk.green(
          `Roles Seed successfully inserted ${errorOrInserts.length} records.`
        )
      );
    }
  }

  static async down() {
    const data = RolesSeed.getData();
    const keyNames = data.map((item) => item.name);
    const errorOrDeletes = await new Promise((resolve, reject) => {
      Role.deleteMany({ name: { $in: keyNames } }, (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      });
    }).catch((err) => err);
    if (errorOrDeletes instanceof Error) {
      console.log(chalk.red("Failure deleting Roles:"), errorOrDeletes);
    } else {
      console.log(
        chalk.green(
          `Roles Seed successfully deleted ${errorOrDeletes.deletedCount}/${errorOrDeletes.n} records.`
        )
      );
    }
  }
}

module.exports.up = async function (next) {
  await dbClient
    .then(async () => {
      await RolesSeed.up();
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
  await dbClient
    .then(async () => {
      await RolesSeed.down();
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
