const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/auth.middleware');
const orders = require('../../controllers/orders.controller.js');

router.get('/', authorize('Manager,Customer,Delivery Person, Sales Executive'), orders.getAll);
router.get('/:orderId', authorize('Manager,Customer,Delivery Person, Sales Executive'), orders.get);
router.put('/:orderId', orders.cartToOrder);
//router.post('/:id/deliveryPerson', authorize('Sales Executive'), orders.assignDeliveryPerson);
//router.delete('/:id/deliveryPerson:deliveryPersonId', authorize('Sales Executive'), orders.unassignDeliveryPerson);
router.post('/:id/status:status', authorize('Sales Executive, Delivery Person, Customer'), orders.updateStatus);
module.exports = router