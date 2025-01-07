const { checkSchema } = require('express-validator');
const { use } = require('../v1/routes/cart.routes');

const authSchema = {
    username: {
        exists: {
            errorMessage: 'Username cannot be null'
        },
        isString: {
            errorMessage: 'Username must be a string'
        },
        notEmpty: {
            errorMessage: 'Username cannot be empty'
        },
        trim: true,
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Username must be between 3 and 50 characters'
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
            options: { min: 8, max: 13 },
            errorMessage: 'password name must be between 8 and 12 characters'
        },
        matches: {
            options: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,13}$/,
            errorMessage: 'Password must contain at least one letter and one number'
        }
    }
};

module.exports = {
    validateAuth: checkSchema(authSchema)
};