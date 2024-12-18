const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orders.controller.js');

router.get('/:userId', orderController.getOrders);

module.exports = router