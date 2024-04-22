const express = require("express");
const Router = express.Router();
const authenticateRequest = require("../Middlewares/auth.middleware");
const corsParse = require("../Middlewares/cors.middleware");
const dashboardController = require("../Controllers/dashboard.controller");

Router.get("/", authenticateRequest, corsParse, dashboardController.getAll);
Router.get("/org", authenticateRequest, corsParse, dashboardController.getAllOrg);
Router.get("/user", authenticateRequest, corsParse, dashboardController.getAllUser);

module.exports = Router;