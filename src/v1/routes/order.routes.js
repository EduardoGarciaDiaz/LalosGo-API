const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/auth.middleware');
const orders = require('../../controllers/orders.controller.js');

router.get('/', authorize('Customer,Delivery Person,Sales Executive'), orders.getAll);
router.get('/:orderId', authorize('Customer,Delivery Person,Sales Executive'), orders.get);
router.put('/:orderId', authorize('Customer'), orders.cartToOrder);
router.put('/:orderId/deliveryPerson/:deliveryPersonId', authorize('Sales Executive'), orders.assignDeliveryPerson);
router.post('/:id/:status', authorize('Sales Executive,Delivery Person,Customer'), orders.updateStatus);

module.exports = router