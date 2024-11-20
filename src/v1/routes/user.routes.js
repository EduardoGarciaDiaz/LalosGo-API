const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users.controller');

router.post('/:userId/payment-methods', userController.postPaymentMethod);

module.exports = router