const { checkSchema } = require('express-validator');

const addressSchema = {
    'address.street': {
        exists: {
            errorMessage: 'Street is required'
        },
        isString: {
            errorMessage: 'Street must be a string'
        },
        notEmpty: {
            errorMessage: 'Street cannot be empty'
        }
    },
    'address.number': {
        exists: {
            errorMessage: 'Number is required'
        },
        isInt: {
            errorMessage: 'Number must be an integer'
        }
    },
    'address.cologne': {
        exists: {
            errorMessage: 'Cologne is required'
        },
        isString: {
            errorMessage: 'Cologne must be a string'
        },
        notEmpty: {
            errorMessage: 'Cologne cannot be empty'
        }
    },
    'address.zipcode': {
        exists: {
            errorMessage: 'Zipcode is required'
        },
        isInt: {
            errorMessage: 'Zipcode must be an integer'
        }
    },
    'address.locality': {
        exists: {
            errorMessage: 'Locality is required'
        },
        isString: {
            errorMessage: 'Locality must be a string'
        },
        notEmpty: {
            errorMessage: 'Locality cannot be empty'
        }
    },
    'address.municipality': {
        exists: {
            errorMessage: 'Municipality is required'
        },
        isString: {
            errorMessage: 'Municipality must be a string'
        },
        notEmpty: {
            errorMessage: 'Municipality cannot be empty'
        }
    },
    'address.federalEntity': {
        exists: {
            errorMessage: 'Federal Entity is required'
        },
        isString: {
            errorMessage: 'Federal Entity must be a string'
        },
        notEmpty: {
            errorMessage: 'Federal Entity cannot be empty'
        }
    },
    'address.internalNumber': {
        optional: true,
        isInt: {
            errorMessage: 'Internal number must be an integer'
        }
    },
    'address.location.type': {
        exists: {
            errorMessage: 'Location type is required'
        },
        isIn: {
            options: [['Point']],
            errorMessage: 'Location type must be Point'
        }
    },
    'address.location.coordinates': {
        exists: {
            errorMessage: 'Coordinates are required'
        },
        isArray: {
            errorMessage: 'Coordinates must be an array'
        },
        custom: {
            options: (value) => {
                if (!Array.isArray(value) || value.length !== 2) {
                    throw new Error('Coordinates must be an array of 2 numbers');
                }
                if (!value.every(num => typeof num === 'number')) {
                    throw new Error('Coordinates must be numbers');
                }
                const [latitude, longitude] = value;
                if (latitude < -90 || latitude > 90) {
                    throw new Error('latitude must be between -180 and 180');
                }
                if (longitude < -180 || longitude > 180) {
                    throw new Error('longitude must be between -90 and 90');
                }
                return true;
            }
        }
    }
};

const branchIdParamSchema = {
    branchId: {
        in: ['params'],
        exists: {
            errorMessage: 'Branch ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Branch ID format'
        }
    }
};

const createBranchSchema = {
    name: {
        exists: {
            errorMessage: 'Name is required'
        },
        isString: {
            errorMessage: 'Name must be a string'
        },
        notEmpty: {
            errorMessage: 'Name cannot be empty'
        }
    },
    openingTime: {
        exists: {
            errorMessage: 'Opening time is required'
        },
        matches: {
            options: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            errorMessage: 'Opening time must be in HH:MM format'
        }
    },
    closingTime: {
        exists: {
            errorMessage: 'Closing time is required'
        },
        matches: {
            options: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            errorMessage: 'Closing time must be in HH:MM format'
        }
    },
    ...addressSchema
};

const editBranchSchema = {
    ...branchIdParamSchema,
    name: {
        optional: true,
        isString: {
            errorMessage: 'Name must be a string'
        },
        notEmpty: {
            errorMessage: 'Name cannot be empty when provided'
        }
    },
    openingTime: {
        optional: true,
        matches: {
            options: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            errorMessage: 'Opening time must be in HH:MM format'
        }
    },
    closingTime: {
        optional: true,
        matches: {
            options: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            errorMessage: 'Closing time must be in HH:MM format'
        }
    },
    branchProducts: {
        optional: true,
        isArray: {
            errorMessage: 'Branch products must be an array'
        },
        custom: {
            options: (value) => {
                if (!Array.isArray(value)) return false;
                return value.every(item => {
                    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                        throw new Error('Invalid product ID');
                    }
                    if (typeof item.quantity !== 'number' || item.quantity < 0) {
                        throw new Error('Quantity must be a positive number');
                    }
                    return true;
                });
            }
        }
    },
    changeStatus: {
        optional: true,
        in: ['query'],
        isIn: {
            options: [['Active', 'Inactive']],
            errorMessage: 'Status must be either Active or Inactive'
        }
    },
    ...addressSchema
};

const consultBranchSchema = {
    ...branchIdParamSchema
};

const toggleBranchStatusSchema = {
    ...branchIdParamSchema
};

module.exports = {
    validateCreateBranch: checkSchema(createBranchSchema),
    validateEditBranch: checkSchema(editBranchSchema),
    validateConsultBranch: checkSchema(consultBranchSchema),
    validateToggleBranchStatus: checkSchema(toggleBranchStatusSchema)
};