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
    validateRecoverPassword
} = require('../../validators/user.schema.validator.js');

const {
    validateCreateAddress, 
    validateModifyAddress, 
    validateDeleteAddress, 
    validateGetAddresses
} = require('../../validators/address.schema.validator.js');


router.get('/:userId/payment-methods', authorize('Customer'), validateGetPaymentMethods, userController.getPaymentMethods);
router.post('/:userId/payment-methods', authorize('Customer'), validateCreatePaymentMethod, userController.postPaymentMethod);
router.delete('/:userId/payment-methods/:paymentMethodId', authorize('Customer'), validateDeletePaymentMethod, userController.deletePaymentMethod);
router.post('/', validateCreateClientAccount, userController.createClientAccount);
router.put('/:id', authorize('Customer'), validateUpdateClientAccount, userController.updateClientAccount);
router.patch('/:userId/password',validateRecoverPassword, userController.recoverPassword);

router.get('/:userId/addresses', authorize('Customer'), validateGetAddresses, AddressController.getAddresses);
router.put('/:userId/addresses', authorize('Customer'), AddressController.updateCurrentAddresStatus)
router.post('/:userId/addresses', authorize('Customer'), validateCreateAddress,  AddressController.postAddress);
router.put('/:userId/addresses/:addressId', authorize('Customer'), validateModifyAddress, AddressController.putAddress);
router.post('/password', userController.sendEmail)
router.delete('/:userId/addresses/:addressId', authorize('Customer'), validateDeleteAddress, AddressController.deleteAddress);

module.exports = router
