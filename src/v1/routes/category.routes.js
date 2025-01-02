const express = require('express');
const router = express.Router();
const CategoriesController = require('../../controllers/categories.controller.js');
const authorize = require('../../middlewares/auth.middleware');

router.post('/', authorize('Administrator'),  CategoriesController.createCategory);
router.put('/:categoryId', authorize('Administrator'), CategoriesController.editCategory)
router.get('/', authorize('Administrator'),  CategoriesController.consultCategories)

module.exports =  router