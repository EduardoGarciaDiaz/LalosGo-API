const Express = require('express');
const Router = Express.Router();
const ProductsController = require('../../controllers/products.controller.js');

Router.get('/', ProductsController.getAllProducts);