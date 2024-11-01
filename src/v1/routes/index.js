const Express = require('express');
const Router = Express.Router();
const ProductRoutes = require('./product.routes');

Router.use('/products', ProductRoutes);
Express.Router();