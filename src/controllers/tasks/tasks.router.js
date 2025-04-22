const express = require("express");

const {
  findTasks,
  findDeletedTasks,
  findOneTask,
  createTask,
  updateTask,
  removeTask,
} = require("./tasks.controller");

const { setMiddlewareAddOwner, setMiddlewareValidateOwner, setMiddlewareRestoreTask } = require("./tasks.middleware");

const tasks = new express.Router();

tasks.get("/", findTasks);

tasks.get("/deleted", findDeletedTasks);

tasks.get("/:id", findOneTask);

tasks.post("/", setMiddlewareAddOwner, createTask);

tasks.patch("/:id", setMiddlewareValidateOwner, updateTask);

tasks.patch("/:id/restore", setMiddlewareValidateOwner, setMiddlewareRestoreTask, findOneTask);

tasks.delete("/:id", setMiddlewareValidateOwner, removeTask);

module.exports = tasks;
