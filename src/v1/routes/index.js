const express = require('express');
const router = express.router();
const ProductRoutes = require('./product.routes');

router.use('/products', ProductRoutes);
express.router();