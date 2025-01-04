const { checkSchema } = require('express-validator');
const { validateGetAddresses } = require('./user.schema.validator');

const createAddressSchema = {
    userId: {
        in:['params'],
        exists: {
            errorMessage: 'User id is required'
        },
        isMongoId: {
            errorMessage: 'Invalid user id format'
        }
    },
    street:{
        exists: {
            errorMessage: 'street is required'
        },
        isString: {
            errorMessage: 'Street must be a string'
        }, 
        trim: true,
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Street must be between 3 and 50 characters'
        }
    }, 
    number:{
        exists: {
            errorMessage: 'External number is required'
        }, 
        isInt: {
            options: { min: 1, max: 99999 },
            errorMessage: 'Internal number must be a integer'
        } 
    }, 
    cologne:{
        exists: {
            errorMessage: 'Cologne is required'
        },
        isString: {
            errorMessage: 'Cologne must be a string'
        }, 
        trim: true,
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Cologne must be between 3 and 50 characters'
        }
    },
    zipcode:{
        exists: {
            errorMessage: 'Zipcode is required'
        },
        isInt: {
            errorMessage: 'Zipcode must be a integer'
        }, 
        trim: true,
        isLength: {
            options: { min: 5, max: 5 },
            errorMessage: 'Zipcode must be 5 characters'
        }
    },
    locality:{
        exists:{
            errorMessage: 'Locality is required'
        },
        isString: {
            errorMessage: 'Locality must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: 'Locality must be between 3 and 100 characters'
        }
    }, 
    federalEntity: {
        exists: {
            errorMessage: 'Federal entity is required'
        },
        isString: {
            errorMessage: 'Federal entity must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: 'Federal entity must be between 3 and 100 characters'
        }
    }, 
    internalNumber:{
        exists: {
            errorMessage: 'Internal number is required'
        },
        isInt: {
            options: { min: 1, max: 99999 },
            errorMessage: 'Internal number must be a integer'
        }, 
    },
    type:{
        exists: {
            errorMessage: 'Type is required'
        },
        equals: {
            options: ['Point'],
            errorMessage: 'Type must be Point'
        }
    },
    latitude: {
        exists: {
            errorMessage: 'Latitude is required'
        },
        isFloat: {
            errorMessage: 'Latitude must be a float'
        }
    },
    longitude: {
        exists: {
            errorMessage: 'Longitude is required'
        },
        isFloat: {
            errorMessage: 'Longitude must be a float'
        }
    },
    isCurrentAddress:{
        exists: {
            errorMessage: 'Is current address is required'
        },
        isBoolean: {
            errorMessage: 'Is current address must be a boolean'
        }
    }
}

const modifyAddressSchema = {
    userId: {
        in:['params'],
        exists: {
            errorMessage: 'User id is required'
        },
        isMongoId: {
            errorMessage: 'Invalid user id format'
        }
    },
    addressId: {
        in: ['params'],
        exists: {
            errorMessage: 'Address ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Address ID format'
        }
    },
    street:{
        exists: {
            errorMessage: 'street is required'
        },
        isString: {
            errorMessage: 'Street must be a string'
        }, 
        trim: true,
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Street must be between 3 and 50 characters'
        }
    }, 
    number:{
        exists: {
            errorMessage: 'External number is required'
        }, 
        isInt: {
            options: { min: 1, max: 99999 },
            errorMessage: 'Internal number must be a integer'
        } 
    }, 
    cologne:{
        exists: {
            errorMessage: 'Cologne is required'
        },
        isString: {
            errorMessage: 'Cologne must be a string'
        }, 
        trim: true,
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Cologne must be between 3 and 50 characters'
        }
    },
    zipcode:{
        exists: {
            errorMessage: 'Zipcode is required'
        },
        isInt: {
            errorMessage: 'Zipcode must be a integer'
        }, 
        trim: true,
        isLength: {
            options: { min: 5, max: 5 },
            errorMessage: 'Zipcode must be 5 characters'
        }
    },
    locality:{
        exists:{
            errorMessage: 'Locality is required'
        },
        isString: {
            errorMessage: 'Locality must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: 'Locality must be between 3 and 100 characters'
        }
    }, 
    federalEntity: {
        exists: {
            errorMessage: 'Federal entity is required'
        },
        isString: {
            errorMessage: 'Federal entity must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: 'Federal entity must be between 3 and 100 characters'
        }
    }, 
    internalNumber:{
        exists: {
            errorMessage: 'Internal number is required'
        },
        isInt: {
            options: { min: 1, max: 99999 },
            errorMessage: 'Internal number must be a integer'
        }, 
    },
    latitude: {
        exists: {
            errorMessage: 'Latitude is required'
        },
        isFloat: {
            errorMessage: 'Latitude must be a float'
        }
    },
    longitude: {
        exists: {
            errorMessage: 'Longitude is required'
        },
        isFloat: {
            errorMessage: 'Longitude must be a float'
        }
    }
}

const deleteAddressSchema = {
    userId: {
        in: ['params'],
        exists: {
            errorMessage: 'User ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid User ID format'
        }
    },
    addressId: {
        in: ['params'],
        exists: {
            errorMessage: 'Address ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Address ID format'
        }
    }
}

const getAddressesSchema = {
    userId: {
        in: ['params'],
        exists: {
            errorMessage: 'User ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid User ID format'
        }
    }
}


module.exports = {
    validateCreateAddress: checkSchema(createAddressSchema),
    validateModifyAddress: checkSchema(modifyAddressSchema), 
    validateDeleteAddress: checkSchema(deleteAddressSchema), 
    validateGetAddresses: checkSchema(getAddressesSchema)
}