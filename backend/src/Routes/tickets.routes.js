const express = require('express');
const Router = express.Router();
const corsParse = require('../Middlewares/cors.middleware');
const ticketsController = require('../Controllers/tickets.controller');

Router.post('/add-new-order', corsParse, ticketsController.add);

Router.delete('/:id', corsParse, ticketsController.remove);

Router.get('/all/:role', corsParse, ticketsController.getAllWithRole);
Router.get('/', corsParse, ticketsController.getAll);
Router.get('/:id', corsParse, ticketsController.getOne);
Router.patch('/:id', corsParse, ticketsController.update);

module.exports = Router;
