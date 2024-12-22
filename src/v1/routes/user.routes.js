const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users.controller');
const authorize = require('../../middlewares/auth.middleware');

router.get('/:userId/payment-methods', userController.getPaymentMethods);
router.post('/:userId/payment-methods', userController.postPaymentMethod);
router.delete('/:userId/payment-methods/:paymentMethodId', userController.deletePaymentMethod);
router.patch('/:userId/payment-methods/:paymentMethodId', userController.updatePaymentMethod);
router.post('/', userController.createClientAccount);
router.get('/:userId/addresses', userController.getAddresses);
router.put('/:id', /*authorize('customer'),*/  userController.updateClientAccount);
router.patch('/:id', /*authorize('customer'),*/ userController.recoverPassword);

module.exports = router