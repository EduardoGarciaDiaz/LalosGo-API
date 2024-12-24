const { checkSchema } = require('express-validator');

const createClientAccountSchema = {
    username: {
        optional: false,
        isString: {
            errorMessage: 'Username must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Username must be between 3 and 50 characters'
        }
    },
    fullname: {
        exists: {
            errorMessage: 'Full name is required'
        },
        isString: {
            errorMessage: 'Full name must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: 'Full name must be between 3 and 100 characters'
        }
    },
    birthdate: {
        exists: {
            errorMessage: 'Birthdate is required'
        },
        isISO8601: {
            errorMessage: 'Invalid birthdate format. Use ISO8601 format (YYYY-MM-DD)'
        },
        custom: {
            options: (value) => {
                const birthDate = new Date(value);
                const today = new Date();
                if (birthDate > today) {
                    throw new Error('Birthdate cannot be in the future');
                }
                return true;
            }
        }
    },
    phone: {
        exists: {
            errorMessage: 'Phone number is required'
        },
        isInt: {
            errorMessage: 'Phone must be a number'
        },
        isLength: {
            options: { min: 10, max: 10 },
            errorMessage: 'Phone must be exactly 10 digits'
        }
    },
    email: {
        optional: false,
        isEmail: {
            errorMessage: 'Invalid email format'
        }
    },
    password: {
        exists: {
            errorMessage: 'Password is required'
        },
        isString: {
            errorMessage: 'Password must be a string'
        },
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password must be at least 8 characters long'
        },
        matches: {
            options: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            errorMessage: 'Password must contain at least one letter and one number'
        }
    }
};

const updateClientAccountSchema = {
    id: {
        in: ['params'],
        exists: {
            errorMessage: 'User ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid User ID format'
        }
    },
    username: {
        optional: true,
        isString: {
            errorMessage: 'Username must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Username must be between 3 and 50 characters'
        }
    },
    fullname: {
        optional: true,
        isString: {
            errorMessage: 'Full name must be a string'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: 'Full name must be between 3 and 100 characters'
        }
    },
    birthdate: {
        optional: true,
        isISO8601: {
            errorMessage: 'Invalid birthdate format. Use ISO8601 format (YYYY-MM-DD)'
        },
        custom: {
            options: (value) => {
                const birthDate = new Date(value);
                const today = new Date();
                if (birthDate > today) {
                    throw new Error('Birthdate cannot be in the future');
                }
                return true;
            }
        }
    },
    phone: {
        optional: true,
        isInt: {
            errorMessage: 'Phone must be a number'
        },
        isLength: {
            options: { min: 10, max: 10 },
            errorMessage: 'Phone must be exactly 10 digits'
        }
    }
};

const recoverPasswordSchema = {
    userId: {
        in: ['params'],
        exists: {
            errorMessage: 'User ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid User ID format'
        }
    },
    newPassword: {
        exists: {
            errorMessage: 'New password is required'
        },
        isString: {
            errorMessage: 'New password must be a string'
        },
        isLength: {
            options: { min: 8 },
            errorMessage: 'New password must be at least 8 characters long'
        },
        matches: {
            options: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            errorMessage: 'New password must contain at least one letter and one number'
        }
    },
    confirmPassword: {
        exists: {
            errorMessage: 'Confirm password is required'
        },
        custom: {
            options: (value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Passwords do not match');
                }
                return true;
            }
        }
    }
};

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
};

module.exports = {
    validateCreateClientAccount: checkSchema(createClientAccountSchema),
    validateUpdateClientAccount: checkSchema(updateClientAccountSchema),
    validateRecoverPassword: checkSchema(recoverPasswordSchema),
    validateGetAddresses: checkSchema(getAddressesSchema)
};