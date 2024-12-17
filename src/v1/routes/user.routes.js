const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users.controller');

router.get('/:userId/payment-methods', userController.getPaymentMethods);
router.post('/:userId/payment-methods', userController.postPaymentMethod);
router.delete('/:userId/payment-methods/:paymentMethodId', userController.deletePaymentMethod);
router.patch('/:userId/payment-methods/:paymentMethodId', userController.updatePaymentMethod);
router.post('/', userController.createClientAccount);
router.put('/:userId', userController.updateClientAccount);
router.patch('/:userId', userController.recoverPassword);

module.exports = router