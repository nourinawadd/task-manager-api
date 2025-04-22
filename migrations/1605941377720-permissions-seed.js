"use strict";

const mongoose = require("mongoose");
const chalk = require("chalk");

const dbClient = require("../src/db/mongoose");
const { ACTIONS } = require("../src/modules/constants");
const Permission = require("../src/models/Permission");

class PermissionsSeed {
  static getData() {
    return [
      {
        name: "get_users",
        method: ACTIONS.GET,
        path: "/users",
        active: true,
      },
      {
        name: "post_users",
        method: ACTIONS.POST,
        path: "/users",
        active: true,
      },
      {
        name: "get_users_id",
        method: ACTIONS.GET,
        path: "/users/:id",
        active: true,
      },
      {
        name: "get_user_id_avatar",
        method: ACTIONS.GET,
        path: "/users/:id/avatar",
        active: true,
      },
      {
        name: "patch_users_id",
        method: ACTIONS.PATCH,
        path: "/users/:id",
        active: true,
      },
      {
        name: "delete_users_id",
        method: ACTIONS.DELETE,
        path: "/users/:id",
        active: true,
      },
      {
        name: "get_tasks",
        method: ACTIONS.GET,
        path: "/tasks",
        active: true,
      },
      {
        name: "post_tasks",
        method: ACTIONS.POST,
        path: "/tasks",
        active: true,
      },
      {
        name: "patch_tasks_id",
        method: ACTIONS.PATCH,
        path: "/tasks/:id",
        active: true,
      },
      {
        name: "delete_tasks_id",
        method: ACTIONS.DELETE,
        path: "/tasks/:id",
        active: true,
      },
      {
        name: "get_tasks_deleted",
        method: ACTIONS.GET,
        path: "/tasks/deleted",
        active: true,
      },
      {
        name: "patch_tasks_id_restore",
        method: ACTIONS.PATCH,
        path: "/tasks/:id/restore",
        active: true,
      },
      {
        name: "post_uploads_avatar",
        method: ACTIONS.POST,
        path: "/uploads/avatar",
        active: true,
      },
      {
        name: "delete_uploads_avatar",
        method: ACTIONS.DELETE,
        path: "/uploads/avatar",
        active: true,
      },
    ];
  }
  static async up() {
    const data = PermissionsSeed.getData();
    const errorOrInserts = await new Promise((resolve, reject) => {
      Permission.insertMany(data, (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      });
    }).catch((err) => err);
    if (errorOrInserts instanceof Error) {
      console.log(chalk.red("Failed inserting permissions:"), errorOrInserts);
    } else {
      console.log(
        chalk.green(
          `Permissions Seed successfully inserted ${errorOrInserts.length} records.`
        )
      );
    }
  }

  static async down() {
    const data = PermissionsSeed.getData();
    const keyNames = data.map((item) => item.name);
    const errorOrDeletes = await new Promise((resolve, reject) => {
      Permission.deleteMany({ name: { $in: keyNames } }, (err, response) => {
        if (err) {
          return reject(err);
        }
        resolve(response);
      });
    }).catch((err) => err);
    if (errorOrDeletes instanceof Error) {
      console.log(chalk.red("Failure deleting permissions:"), errorOrDeletes);
    } else {
      console.log(
        chalk.green(
          `Permissions Seed successfully deleted ${errorOrDeletes.deletedCount}/${errorOrDeletes.n} records.`
        )
      );
    }
  }
}

module.exports.up = async function (next) {
  await dbClient
    .then(async () => {
      await PermissionsSeed.up();
      return true;
    })
    .then(() => {
      mongoose.connection.close();
    })
    .catch((error) => {
      mongoose.connection.close();
      console.log(chalk.red.inverse("ERROR CONNECTING TO DB"), error);
    });
  next();
};

module.exports.down = async function (next) {
  await dbClient
    .then(async () => {
      await PermissionsSeed.down();
      return true;
    })
    .then(() => {
      mongoose.connection.close();
    })
    .catch((error) => {
      mongoose.connection.close();
      console.log(chalk.red.inverse("ERROR CONNECTING TO DB"), error);
    });
  next();
};
