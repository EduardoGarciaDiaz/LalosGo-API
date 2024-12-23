const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/carts.controller.js');
const {
    validateCreateCart,
    validateGetCart,
    validateDeleteCart,
    validateUpdateCartQuantities,
    validateGetMainCartDetails
} = require('../../validators/cart.schema.validator.js');

router.post('/', validateCreateCart, cartController.creteCart)
router.get('/:userId', validateGetCart, cartController.getCart);
router.get('/:userId/total', validateGetMainCartDetails, cartController.getMainCartDetails);
router.delete('/:orderId', validateDeleteCart, cartController.deleteCart);
router.patch('/:orderId', validateUpdateCartQuantities, cartController.updateCartQuantities);

module.exports = router