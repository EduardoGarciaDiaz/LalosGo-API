const express = require('express');
const router = express.Router();
const CategoriesController = require('../../controllers/categories.controller.js');

router.post('/', CategoriesController.createCategory);
router.put('/:categoryId', CategoriesController.editCategory)
router.get('/', CategoriesController.consultCategories)

module.exports =  router