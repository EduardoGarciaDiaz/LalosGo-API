const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orders.controller.js');

router.put('/:orderId', orderController.cartToOrder);

module.exports = router