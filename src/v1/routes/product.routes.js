const express = require('express');
const router = express.router();
const ProductsController = require('../../controllers/products.controller.js');

router.get('/', ProductsController.getAllProducts);