const express = require('express');
const Router = express.Router();
const userController = require('../Controllers/user.controller');
const authenticateRequest = require('../Middlewares/auth.middleware');
const corsParse = require('../Middlewares/cors.middleware');

Router.post('/signup-user', corsParse, userController.verifyAccountCode);
Router.post('/verify-account/:code', corsParse, userController.signup);
Router.post('/login-user', corsParse, userController.login);
Router.post(
  '/add-new-user',
  authenticateRequest,
  corsParse,
  userController.add
);
Router.post(
  '/add-new-user/organization',
  authenticateRequest,
  corsParse,
  userController.add
);

Router.delete('/:id', authenticateRequest, corsParse, userController.remove);

Router.get('/', authenticateRequest, corsParse, userController.getAll);
Router.get(
  '/organization-customer',
  authenticateRequest,
  corsParse,
  userController.getAllOrganizationsUsers
);
Router.get(
  '/organization-contact',
  authenticateRequest,
  corsParse,
  userController.getAllOrganizationsUsers
);
Router.get(
  '/organization',
  authenticateRequest,
  corsParse,
  userController.getAllOrganizations
);
Router.get('/:id', authenticateRequest, corsParse, userController.getOne);

Router.patch('/:id', authenticateRequest, corsParse, userController.update);

module.exports = Router;
