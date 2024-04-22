const express = require("express");
const Router = express.Router();
const authenticateRequest = require("../Middlewares/auth.middleware");
const corsParse = require("../Middlewares/cors.middleware");
const notesController = require("../Controllers/notes.controller");

Router.post("/add-new-notes", authenticateRequest, corsParse, notesController.add);

Router.delete("/:id", authenticateRequest, corsParse, notesController.remove);

Router.get("/:id", authenticateRequest, corsParse, notesController.getAll);
Router.get("/all/admin", authenticateRequest, corsParse, notesController.getAllAdmin);
// Router.get("/:id", authenticateRequest, corsParse, notesController.getOne);

module.exports = Router;