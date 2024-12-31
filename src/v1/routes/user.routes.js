const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users.controller');
const authorize = require('../../middlewares/auth.middleware');
const { 
    validateCreatePaymentMethod,
    validateDeletePaymentMethod,
    validateGetPaymentMethods 
} = require('../../validators/payment.schema.validator.js');

const {
    validateCreateClientAccount,
    validateUpdateClientAccount, 
    validateRecoverPassword, 
    validateGetAddresses
} = require('../../validators/user.schema.validator.js');

router.get('/:userId/payment-methods',/*TODO: authorize('Customer'),*/validateGetPaymentMethods, userController.getPaymentMethods);
router.post('/:userId/payment-methods',/*TODO: authorize('Customer'),*/validateCreatePaymentMethod, userController.postPaymentMethod);
router.delete('/:userId/payment-methods/:paymentMethodId',/*TODO: authorize('Customer'),*/validateDeletePaymentMethod, userController.deletePaymentMethod);
router.post('/', validateCreateClientAccount, userController.createClientAccount);
router.put('/:id', /*authorize('customer'),*/ validateUpdateClientAccount, userController.updateClientAccount);
router.patch('/:userId/password', /*authorize('customer'),*/ validateRecoverPassword, userController.recoverPassword);
router.get('/:userId/addresses', validateGetAddresses, userController.getAddresses);
router.post('/:userId/addresses', userController.postAddress);
router.put('/:userId/addresses/:addressId', userController.putAddress);
router.post('/password', userController.sendEmail)

module.exports = router