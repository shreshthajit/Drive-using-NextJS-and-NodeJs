const express = require('express');
const multer = require('multer');
const Router = express.Router();
const contactController = require('../Controllers/contact.controller');
const authenticateRequest = require('../Middlewares/auth.middleware');
const corsParse = require('../Middlewares/cors.middleware');
multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    console.log('File', file);
    const uniqueFileName = Date.now() + '-' + file.originalname;
    cb(null, uniqueFileName);
  },
});
const upload = multer({ storage: storage });

Router.post(
  '/add-new-contact',
  authenticateRequest,
  corsParse,
  upload.array('files'),
  contactController.add
);
Router.post(
  '/file',
  authenticateRequest,
  corsParse,
  contactController.removeFile
);

Router.delete('/:id', authenticateRequest, corsParse, contactController.remove);

Router.get('/', authenticateRequest, corsParse, contactController.getAll);
Router.get('/:id', authenticateRequest, corsParse, contactController.getOne);

Router.patch(
  '/:id',
  authenticateRequest,
  corsParse,
  upload.array('files'),
  contactController.update
);

module.exports = Router;
