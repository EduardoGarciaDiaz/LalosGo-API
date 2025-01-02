const express = require('express');
const router = express.Router();
const ProductsController = require('../../controllers/products.controller.js');
const authorize = require('../../middlewares/auth.middleware');

router.post('/',authorize('Administrator'), ProductsController.createProduct)
router.put('/:productId', authorize('Administrator'), ProductsController.editProduct)
router.post('/:productId/images', authorize('Administrator'), ProductsController.createProductImage)
router.put('/:productId/images', authorize('Administrator'), ProductsController.editProductImage)
router.get('/:branchId', authorize('Administrator,Customer'), ProductsController.getBranchProducts)
router.get('/:branchId/:categoryId', authorize('Administrator,Customer'), ProductsController.getBranchProducts)
router.get('/', authorize('Administrator'), ProductsController.getProducts)
router.patch('/:productId', authorize('Administrator,Customer'), ProductsController.patchProduct)


module.exports = router