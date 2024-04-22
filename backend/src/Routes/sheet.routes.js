const express = require("express");
const authenticateRequest = require("../Middlewares/auth.middleware");
const corsParse = require("../Middlewares/cors.middleware");

const {
  createSheet,
  getSheet,
  getRecentSheets,
  updateSheet,
  deleteSheet,
} = require("../Controllers/sheet.controller");

const Router = express.Router();

// Applying Middlewares
Router.use(corsParse);
Router.use(authenticateRequest);

// Routes
Router.route("/").post(createSheet);
Router.route("/recent").get(getRecentSheets);
Router.route("/:id").get(getSheet).put(updateSheet).delete(deleteSheet);

module.exports = Router;
