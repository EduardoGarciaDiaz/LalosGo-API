const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users.controller');
const authorize = require('../../middlewares/auth.middleware');
const { 
    validateCreatePaymentMethod,
    validateDeletePaymentMethod,
    validateGetPaymentMethods 
} = require('../../validators/payment.schema.validator.js');

router.get('/:userId/payment-methods',/*TODO: authorize('Customer'),*/validateGetPaymentMethods, userController.getPaymentMethods);
router.post('/:userId/payment-methods',/*TODO: authorize('Customer'),*/validateCreatePaymentMethod, userController.postPaymentMethod);
router.delete('/:userId/payment-methods/:paymentMethodId',/*TODO: authorize('Customer'),*/validateDeletePaymentMethod, userController.deletePaymentMethod);

// Hice el archivo para validar esto @Lalo, pero sería cuestión de que revises el validator si está bien. (validators/user.schema.validator)
// En caso de que está bien, debes hacer lo que hice yo, hacer el require y colocarlo en la ruta, como en paymentMethods...
router.post('/', userController.createClientAccount);
router.put('/:id', /*authorize('customer'),*/  userController.updateClientAccount);
router.patch('/:id', /*authorize('customer'),*/ userController.recoverPassword);
router.get('/:userId/addresses', userController.getAddresses);
router.post('/:userId/addresses', userController.postAddress);
router.put('/:userId/addresses/:addressId', userController.putAddress);
module.exports = router