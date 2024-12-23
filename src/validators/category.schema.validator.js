const { checkSchema } = require('express-validator');

// Common schema for categoryId parameter
const categoryIdParamSchema = {
    categoryId: {
        in: ['params'],
        exists: {
            errorMessage: 'Category ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Category ID format'
        }
    }
};

// Schema for creating a new category
const createCategorySchema = {
    identifier: {
        exists: {
            errorMessage: 'Identifier is required'
        },
        isString: {
            errorMessage: 'Identifier must be a string'
        },
        notEmpty: {
            errorMessage: 'Identifier cannot be empty'
        },
        trim: true,
        custom: {
            options: (value) => {
                // Agrega el formato requerido para el identificador
                if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                    throw new Error('Identifier can only contain letters, numbers, hyphens and underscores');
                }
                return true;
            }
        }
    },
    name: {
        exists: {
            errorMessage: 'Name is required'
        },
        isString: {
            errorMessage: 'Name must be a string'
        },
        notEmpty: {
            errorMessage: 'Name cannot be empty'
        },
        trim: true,
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: 'Name must be between 2 and 50 characters'
        }
    },
    categoryStatus: {
        optional: true,
        isBoolean: {
            errorMessage: 'Category status must be a boolean'
        }
    }
};

const editCategorySchema = {
    ...categoryIdParamSchema,
    identifier: {
        optional: true,
        isString: {
            errorMessage: 'Identifier must be a string'
        },
        notEmpty: {
            errorMessage: 'Identifier cannot be empty when provided'
        },
        trim: true,
        custom: {
            options: (value) => {
                if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                    throw new Error('Identifier can only contain letters, numbers, hyphens and underscores');
                }
                return true;
            }
        }
    },
    name: {
        optional: true,
        isString: {
            errorMessage: 'Name must be a string'
        },
        notEmpty: {
            errorMessage: 'Name cannot be empty when provided'
        },
        trim: true,
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: 'Name must be between 2 and 50 characters'
        }
    },
    categoryStatus: {
        optional: true,
        isBoolean: {
            errorMessage: 'Category status must be a boolean'
        }
    },
    changeStatus: {
        optional: true,
        in: ['query'],
        isIn: {
            options: [['Active', 'Inactive']],
            errorMessage: 'Status must be either Active or Inactive'
        }
    }
};

module.exports = {
    validateCreateCategory: checkSchema(createCategorySchema),
    validateEditCategory: checkSchema(editCategorySchema)
};