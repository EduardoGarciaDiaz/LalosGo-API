const express = require('express');
const router = express.Router();
const CategoriesController = require('../../controllers/categories.controller.js');

router.post('/', CategoriesController.createCategory);
router.put('/:categoryId', CategoriesController.editCategory)

module.exports =  router