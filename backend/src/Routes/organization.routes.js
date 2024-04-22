const express = require("express");
const Router = express.Router();
const corsParse = require("../Middlewares/cors.middleware");
const organizationController = require("../Controllers/organization.controller");
const authenticateRequest = require("../Middlewares/auth.middleware");

Router.post("/add-new-organization", authenticateRequest, corsParse, organizationController.add);
Router.post("/login-organization", corsParse, organizationController.login);

Router.delete("/:id", authenticateRequest, corsParse, organizationController.remove);

Router.get("/", authenticateRequest, corsParse, organizationController.getAll);
Router.get("/:id", authenticateRequest, corsParse, organizationController.getOne);

Router.patch("/:id", authenticateRequest, corsParse, organizationController.update);
module.exports = Router;