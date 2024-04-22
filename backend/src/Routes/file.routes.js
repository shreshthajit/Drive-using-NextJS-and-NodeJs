const express = require('express');
const Router = express.Router();
const fileController = require('../Controllers/file.controller');
const authenticateRequest = require('../Middlewares/auth.middleware');
const corsParse = require('../Middlewares/cors.middleware');

Router.post(
  '/upload',
  authenticateRequest,
  corsParse,
  fileController.uploadFile
);
Router.get('/search', authenticateRequest, corsParse, fileController.getAll);
Router.get('/shared-file/:id/link/:link', corsParse, fileController.getOneBySharedLink);
Router.get('/:id', authenticateRequest, corsParse, fileController.getOne);
Router.delete('/:id', authenticateRequest, corsParse, fileController.remove);
Router.patch('/:id/move', authenticateRequest, corsParse, fileController.update);
Router.post('/:id/share', authenticateRequest, corsParse, fileController.shareLink);

module.exports = Router;
