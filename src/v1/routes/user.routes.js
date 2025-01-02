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

const {
    validateCreateClientAccount,
    validateUpdateClientAccount, 
    validateRecoverPassword, 
    validateGetAddresses
} = require('../../validators/user.schema.validator.js');

router.get('/:userId/payment-methods', authorize('Customer'), validateGetPaymentMethods, userController.getPaymentMethods);
router.post('/:userId/payment-methods', authorize('Customer'), validateCreatePaymentMethod, userController.postPaymentMethod);
router.delete('/:userId/payment-methods/:paymentMethodId', authorize('Customer'), validateDeletePaymentMethod, userController.deletePaymentMethod);

// Hice el archivo para validar esto @Lalo, pero sería cuestión de que revises el validator si está bien. (validators/user.schema.validator)
// En caso de que está bien, debes hacer lo que hice yo, hacer el require y colocarlo en la ruta, como en paymentMethods...
router.post('/', validateCreateClientAccount, userController.createClientAccount);
router.put('/:id', /*authorize('customer'),*/ validateUpdateClientAccount, userController.updateClientAccount);
router.patch('/:userId/password', /*authorize('customer'),*/ validateRecoverPassword, userController.recoverPassword);
router.get('/:userId/addresses', authorize('Customer'), AddressController.getAddresses);
router.put('/:userId/addresses', authorize('Customer'), AddressController.updateCurrentAddresStatus)
router.post('/:userId/addresses', userController.postAddress);
router.put('/:userId/addresses/:addressId', userController.putAddress);
router.post('/password', userController.sendEmail)

module.exports = router
