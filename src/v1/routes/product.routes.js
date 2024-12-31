const express = require('express');
const router = express.Router();
const ProductsController = require('../../controllers/products.controller.js');

//router.get('/', ProductsController.getAllProducts);
router.post('/', ProductsController.createProduct)
router.put('/:productId', ProductsController.editProduct)
router.post('/:productId/images', ProductsController.createProductImage)
router.put('/:productId/images', ProductsController.editProductImage)
router.get('/:branchId', ProductsController.getBranchProducts)
router.get('/:branchId/:categoryId', ProductsController.getBranchProducts)
router.get('/', ProductsController.getProducts)
router.patch('/:productId', ProductsController.patchProduct)


module.exports = router