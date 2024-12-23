const { checkSchema } = require('express-validator');

const createCartSchema = {
    userId: {
        exists: {
            errorMessage: 'User ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid User ID format'
        }
    },
    branchId: {
        exists: {
            errorMessage: 'Branch ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Branch ID format'
        }
    },
    'productForCart.product': {
        exists: {
            errorMessage: 'Product ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Product ID format'
        }
    },
    'productForCart.quantity': {
        exists: {
            errorMessage: 'Quantity is required'
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Quantity must be a positive integer'
        }
    },
    'productForCart.price': {
        exists: {
            errorMessage: 'Price is required'
        },
        isFloat: {
            options: { min: 0 },
            errorMessage: 'Price must be a positive number'
        }
    }
};

const getCartSchema = {
    userId: {
        in: ['params'],
        exists: {
            errorMessage: 'User ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid User ID format'
        }
    },
    status: {
        in: ['query'],
        exists: {
            errorMessage: 'Status is required'
        },
        equals: {
            options: 'reserved',
            errorMessage: 'Status must be "reserved" for cart operations'
        }
    }
};

const deleteCartSchema = {
    orderId: {
        in: ['params'],
        exists: {
            errorMessage: 'Order ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Order ID format'
        }
    },
    status: {
        in: ['query'],
        exists: {
            errorMessage: 'Status is required'
        },
        equals: {
            options: 'reserved',
            errorMessage: 'Status must be "reserved" for cart operations'
        }
    }
};

const updateCartQuantitiesSchema = {
    orderId: {
        in: ['params'],
        exists: {
            errorMessage: 'Order ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Order ID format'
        }
    },
    status: {
        in: ['query'],
        exists: {
            errorMessage: 'Status is required'
        },
        equals: {
            options: 'reserved',
            errorMessage: 'Status must be "reserved" for cart operations'
        }
    },
    productId: {
        exists: {
            errorMessage: 'Product ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Product ID format'
        }
    },
    quantity: {
        exists: {
            errorMessage: 'Quantity is required'
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Quantity must be a positive integer'
        }
    },
    branchId: {
        exists: {
            errorMessage: 'Branch ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Branch ID format'
        }
    }
};

const getMainCartDetailsSchema = {
    userId: {
        in: ['params'],
        exists: {
            errorMessage: 'User ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid User ID format'
        }
    },
    status: {
        in: ['query'],
        exists: {
            errorMessage: 'Status is required'
        },
        equals: {
            options: 'reserved',
            errorMessage: 'Status must be "reserved" for cart operations'
        }
    }
};

module.exports = {
    validateCreateCart: checkSchema(createCartSchema),
    validateGetCart: checkSchema(getCartSchema),
    validateDeleteCart: checkSchema(deleteCartSchema),
    validateUpdateCartQuantities: checkSchema(updateCartQuantitiesSchema),
    validateGetMainCartDetails: checkSchema(getMainCartDetailsSchema)
};