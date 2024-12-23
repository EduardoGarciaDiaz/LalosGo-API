const { checkSchema } = require('express-validator');

const paymentMethodSchema = {
    cardOwner: {
        exists: {
            errorMessage: 'Card owner cannot be null'
        },
        isString: {
            errorMessage: 'Card owner must be a string'
        },
        notEmpty: {
            errorMessage: 'Card owner cannot be empty'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: 'Card owner must be between 3 and 100 characters'
        }
    },
    cardNumber: {
        exists: {
            errorMessage: 'Card number cannot be null'
        },
        isString: {
            errorMessage: 'Card number must be a string'
        },
        notEmpty: {
            errorMessage: 'Card number cannot be empty'
        },
        matches: {
            options: /^[0-9]{16}$/,
            errorMessage: 'Card number must be 16 digits'
        }
    },
    cardEmitter: {
        optional: true,
        isString: {
            errorMessage: 'Card emitter must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: 'Card emitter must be between 2 and 50 characters'
        }
    },
    expirationDate: {
        exists: {
            errorMessage: 'Expiration date cannot be null'
        },
        notEmpty: {
            errorMessage: 'Expiration date cannot be empty'
        },
        custom: {
            options: (value) => {
                const [month, year] = value.split('/');
                const expirationDate = new Date(year, month - 1);
                const now = new Date();
                if (expirationDate < now) {
                    throw new Error('Card has expired');
                }
                return true;
            }
        }
    },
    cardType: {
        exists: {
            errorMessage: 'Card type cannot be null'
        },
        isString: {
            errorMessage: 'Card type must be a string'
        },
        notEmpty: {
            errorMessage: 'Card type cannot be empty'
        },
        isIn: {
            options: [['Débito', 'Crédito']],
            errorMessage: 'Card type must be either Débito or Crédito'
        }
    },
    paymentNetwork: {
        exists: {
            errorMessage: 'Payment network cannot be null'
        },
        isString: {
            errorMessage: 'Payment network must be a string'
        },
        notEmpty: {
            errorMessage: 'Payment network cannot be empty'
        },
        isIn: {
            options: [['Visa', 'MasterCard']],
            errorMessage: 'Payment network must be either Visa or MasterCard'
        }
    }
};

const userIdParamSchema = {
    userId: {
        in: ['params'],
        exists: {
            errorMessage: 'User ID cannot be null'
        },
        notEmpty: {
            errorMessage: 'User ID cannot be empty'
        },
        isMongoId: {
            errorMessage: 'Invalid User ID format'
        }
    }
};

const paymentMethodIdParamSchema = {
    paymentMethodId: {
        in: ['params'],
        exists: {
            errorMessage: 'Payment Method ID cannot be null'
        },
        notEmpty: {
            errorMessage: 'Payment Method ID cannot be empty'
        },
        isMongoId: {
            errorMessage: 'Invalid Payment Method ID format'
        }
    }
};

const createPaymentMethodSchema = {
    ...userIdParamSchema,
    ...paymentMethodSchema
};

const deletePaymentMethodSchema = {
    ...userIdParamSchema,
    ...paymentMethodIdParamSchema
};

const getPaymentMethodsSchema = {
    ...userIdParamSchema
};

module.exports = {
    validateCreatePaymentMethod: checkSchema(createPaymentMethodSchema),
    validateDeletePaymentMethod: checkSchema(deletePaymentMethodSchema),
    validateGetPaymentMethods: checkSchema(getPaymentMethodsSchema)
};