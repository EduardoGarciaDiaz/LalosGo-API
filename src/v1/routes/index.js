const express = require('express');
const router = express.router();
const ProductRoutes = require('./product.routes');
const CategoryRoutes = require('./category.routes')

router.use('/products', ProductRoutes);
router.use('/categories', CategoryRoutes)

express.router();