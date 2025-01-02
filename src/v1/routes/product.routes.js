const express = require('express');
const router = express.Router();
const ProductsController = require('../../controllers/products.controller.js');
const authorize = require('../../middlewares/auth.middleware');
const {
    validateCreateProduct,
    validateEditProduct,
    validateCreateProductImage,
    validateEditProductImage,
    validateGetBranchProducts,
    validateGetBranchProductsByCategoryId,
    validatePatchProductSatus
} = require('../../validators/product.schema.validator.js')

router.post('/',authorize('Administrator'), validateCreateProduct, ProductsController.createProduct)
router.put('/:productId', authorize('Administrator'), validateEditProduct, ProductsController.editProduct)
router.post('/:productId/images', authorize('Administrator'), validateCreateProductImage, ProductsController.createProductImage)
router.put('/:productId/images', authorize('Administrator'), validateEditProductImage, ProductsController.editProductImage)
router.get('/:branchId', authorize('Administrator,Customer'), validateGetBranchProducts, ProductsController.getBranchProducts)
router.get('/:branchId/:categoryId', authorize('Administrator,Customer'), validateGetBranchProductsByCategoryId, ProductsController.getBranchProducts)
router.get('/', authorize('Administrator'), ProductsController.getProducts)
router.patch('/:productId', authorize('Administrator,Customer'), validatePatchProductSatus, ProductsController.patchProduct)


module.exports = router