const express = require("express");
const authenticateRequest = require("../Middlewares/auth.middleware");
const corsParse = require("../Middlewares/cors.middleware");

const {
  createDocument,
  getDocument,
  getRecentDocuments,
  updateDocument,
  deleteDocument,
} = require("../Controllers/document.controller");

const Router = express.Router();

// Applying Middlewares
Router.use(corsParse);
Router.use(authenticateRequest);

// Routes
Router.route("/").post(createDocument);
Router.route("/recent").get(getRecentDocuments);
Router.route("/:id")
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

module.exports = Router;
