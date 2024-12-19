const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/carts.controller.js');

router.get('/:userId', cartController.getCart);
router.delete('/:userId', cartController.deleteCart);
router.patch('/:userId', cartController.updateCartQuantities);

module.exports = router