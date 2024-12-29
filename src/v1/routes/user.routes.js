const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users.controller');
const AddressController = require('../../controllers/address.controller.js')
const authorize = require('../../middlewares/auth.middleware');
const { 
    validateCreatePaymentMethod,
    validateDeletePaymentMethod,
    validateGetPaymentMethods 
} = require('../../validators/payment.schema.validator.js');

router.get('/:userId/payment-methods', authorize('Customer'), validateGetPaymentMethods, userController.getPaymentMethods);
router.post('/:userId/payment-methods', authorize('Customer'), validateCreatePaymentMethod, userController.postPaymentMethod);
router.delete('/:userId/payment-methods/:paymentMethodId', authorize('Customer'), validateDeletePaymentMethod, userController.deletePaymentMethod);

// Hice el archivo para validar esto @Lalo, pero sería cuestión de que revises el validator si está bien. (validators/user.schema.validator)
// En caso de que está bien, debes hacer lo que hice yo, hacer el require y colocarlo en la ruta, como en paymentMethods...
router.post('/', userController.createClientAccount);
router.put('/:id', /*authorize('customer'),*/  userController.updateClientAccount);
router.patch('/:id', /*authorize('customer'),*/ userController.recoverPassword);

router.get('/:userId/addresses', AddressController.getAddresses);
router.put('/:userId/addresses', AddressController.updateCurrentAddresStatus)
router.post('/:userId/addresses', userController.postAddress);
router.put('/:userId/addresses/:addressId', userController.putAddress);

module.exports = router
