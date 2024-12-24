const { checkSchema } = require('express-validator');

const orderIdParamSchema = {
    orderId: {
        in: ['params'],
        exists: {
            errorMessage: 'Order ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Order ID format'
        }
    }
};

const statusParamSchema = {
    status: {
        in: ['params'],
        exists: {
            errorMessage: 'Status is required'
        },
        isIn: {
            options: [['reserved', 'pending', 'approved', 'denied', 'in transit', 'delivered', 'not delivered', 'canceled']],
            errorMessage: 'Invalid order status'
        }
    }
};

const cartToOrderSchema = {
    ...orderIdParamSchema,
    status: {
        in: ['query'],
        exists: {
            errorMessage: 'Status query parameter is required'
        },
        equals: {
            options: 'reserved',
            errorMessage: 'Status must be "reserved" for cart conversion'
        }
    },
    'customer': {
        exists: {
            errorMessage: 'Customer is required'
        },
        isMongoId: {
            errorMessage: 'Invalid customer ID format'
        }
    },
    'branch': {
        exists: {
            errorMessage: 'Branch is required'
        },
        isMongoId: {
            errorMessage: 'Invalid branch ID format'
        }
    },
    'paymentMethod': {
        exists: {
            errorMessage: 'Payment method is required'
        },
        isString: {
            errorMessage: 'Payment method must be a string'
        },
        notEmpty: {
            errorMessage: 'Payment method cannot be empty'
        }
    },
    'orderProducts': {
        exists: {
            errorMessage: 'Order products are required'
        }
    }
};

const updateStatusSchema = {
    id: {
        in: ['params'],
        exists: {
            errorMessage: 'Order ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Order ID format'
        }
    },
    ...statusParamSchema
};

module.exports = {
    validateCartToOrder: checkSchema(cartToOrderSchema),
    validateGetOrder: checkSchema(orderIdParamSchema),
    validateUpdateStatus: checkSchema(updateStatusSchema)
};