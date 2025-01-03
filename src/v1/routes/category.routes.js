const express = require('express');
const router = express.Router();
const CategoriesController = require('../../controllers/categories.controller.js');
const authorize = require('../../middlewares/auth.middleware'); 
const {
    validateCreateCategory,
    validateEditCategory
} = require('../../validators/category.schema.validator.js')

router.post('/', authorize('Administrator'), validateCreateCategory, CategoriesController.createCategory);
router.put('/:categoryId', authorize('Administrator'), validateEditCategory, CategoriesController.editCategory)
router.get('/', authorize('Administrator'),  CategoriesController.consultCategories)

module.exports =  router