const express = require('express');
const router = express.Router();
const ProductsController = require('../../controllers/products.controller.js');

//router.get('/', ProductsController.getAllProducts);
router.post('/', ProductsController.createProduct)
router.put('/:productId', ProductsController.updateProductImage)
router.get('/:branchId', ProductsController.getBranchProducts)
router.get('/', ProductsController.getProducts)
router.patch('/:productId', ProductsController.patchProduct)


module.exports = router