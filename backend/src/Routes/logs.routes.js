const express = require("express");
const Router = express.Router();
const authenticateRequest = require("../Middlewares/auth.middleware");
const corsParse = require("../Middlewares/cors.middleware");
const logsController = require("../Controllers/logs.controller");
const authenticateOrganization = require("../Middlewares/org.middleware");

Router.post("/add-new-log", authenticateRequest, corsParse, logsController.add);
Router.post("/org-add-new-log", authenticateOrganization, corsParse, logsController.add);

Router.delete("/:id", authenticateRequest, corsParse, logsController.remove);

Router.get("/", authenticateRequest, corsParse, logsController.getAll);
Router.get("/:id", authenticateRequest, corsParse, logsController.getOne);

module.exports = Router;