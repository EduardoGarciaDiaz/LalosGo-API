const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/carts.controller.js');

router.post('/', cartController.creteCart)
router.get('/:userId', cartController.getCart);
router.get('/:userId/total', cartController.getCartPrice);
router.delete('/:orderId', cartController.deleteCart);
router.patch('/:orderId', cartController.updateCartQuantities);

module.exports = router