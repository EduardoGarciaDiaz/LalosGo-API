const express = require('express');
const router = express.Router();
const authorize = require('../../middlewares/auth.middleware');
const orders = require('../../controllers/orders.controller.js');
const { validateCartToOrder, validateGetOrder, validateUpdateStatus, validateDeliveryPersonAssignment } = require('../../validators/order.schema.validator.js');

router.get('/', authorize('Customer,Delivery Person,Sales Executive'), orders.getAll);
router.get('/:orderId', authorize('Customer,Delivery Person,Sales Executive'), validateGetOrder, orders.get);
router.put('/:orderId', authorize('Customer'), validateCartToOrder, orders.cartToOrder);
router.put('/:orderId/deliveryPerson/:deliveryPersonId', authorize('Sales Executive'), validateDeliveryPersonAssignment, orders.assignDeliveryPerson);
router.post('/:id/:status', authorize('Sales Executive,Delivery Person,Customer'), validateUpdateStatus, orders.updateStatus);

module.exports = router