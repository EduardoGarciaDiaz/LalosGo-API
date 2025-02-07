const e = require('express');
const { checkSchema } = require('express-validator');

const employeeIdSchema = {
    id: {
        in: ['params'],
        exists: {
            errorMessage: 'Employee ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Employee ID format'
        }
    }
};

const userSchema = {
    username: {
        exists: {
            errorMessage: 'username is required'
        },
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
    employee: {
        exists: {
            errorMessage: 'Employee is required'
        },
        custom: {
            options: (value) => {
                const { role, hiredDate, branch } = value || {};
                // Validate role
                if (!['Administrator', 'Delivery Person', 'Sales Executive'].includes(role)) {
                    throw new Error('Invalid Role');
                }
                // Validate hiredDate
                const hiredDateObj = new Date(hiredDate);
                const today = new Date();
                if (isNaN(hiredDateObj.getTime()) || hiredDateObj > today) {
                    throw new Error('Invalid or future Hired Date');
                }
                // Validate branch
                if (!/^[a-fA-F0-9]{24}$/.test(branch)) {
                    throw new Error('Invalid Branch ID format');
                }
                return true;
            }
        }
    }
};

const passwordSchema = {

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

const updateEmployeeSchema = {
    id: {
        in: ['params'],
        exists: {
            errorMessage: 'Employee ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Employee ID format'
        }
    },
    ...userSchema
};

const createEmployeeSchema = {
    ...userSchema,
    ...passwordSchema
};

const employeeByRoleSchema = {
    role: {
        in: ['params'],
        exists: {
            errorMessage: 'Role is required'
        },
        isIn: {
            options: [['Administrator', 'Delivery Person', 'Sales Executive']],
            errorMessage: 'Invalid Role'
        }
    },
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

module.exports = {
    validateEmployeeId: checkSchema(employeeIdSchema),
    validateEmployee: checkSchema(createEmployeeSchema),
    validateUpdateEmployee: checkSchema(updateEmployeeSchema),
    validateEmployeeByRole: checkSchema(employeeByRoleSchema)
};