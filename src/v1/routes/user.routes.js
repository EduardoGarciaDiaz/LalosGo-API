const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users.controller');

router.get('/:userId/payment-methods', userController.getPaymentMethods);
router.post('/:userId/payment-methods', userController.postPaymentMethod);
router.delete('/:userId/payment-methods/:paymentMethodId', userController.deletePaymentMethod);

module.exports = router