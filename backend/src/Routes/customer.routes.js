const express = require("express");
const multer = require('multer');
const Router = express.Router();
const customerController = require("../Controllers/customer.controller");
const authenticateRequest = require("../Middlewares/auth.middleware");
const corsParse = require("../Middlewares/cors.middleware");
multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        console.log("File", file);
        const uniqueFileName = Date.now() + '-' + file.originalname;
        cb(null, uniqueFileName);
    },
});
const upload = multer({ storage: storage });

Router.post("/add-new-customer", authenticateRequest, corsParse, upload.array('files'), customerController.add);
Router.post("/file", authenticateRequest, corsParse, customerController.removeFile);

Router.delete("/:id", authenticateRequest, corsParse, customerController.remove);

Router.get("/", authenticateRequest, corsParse, customerController.getAll);
Router.get("/:id", authenticateRequest, corsParse, customerController.getOne);

Router.patch("/:id", authenticateRequest, corsParse, upload.array('files'), customerController.update);

module.exports = Router;