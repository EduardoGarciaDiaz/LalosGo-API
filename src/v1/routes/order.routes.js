const express = require('express');
const router = express.Router();
const orders = require('../../controllers/orders.controller.js');

router.get('/', authorize('Manager,Customer,Delivery Person, Sales Executive'), orders.getAll);
router.put('/:orderId', orders.cartToOrder);

module.exports = router