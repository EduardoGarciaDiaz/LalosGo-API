const { checkSchema } = require('express-validator');

const createProductSchema = {
    barCode: {
        exists: {
            errorMessage: 'Bar code is required'
        },
        isString: {
            errorMessage: 'Bar code must be a string'
        },
        trim: true,
        notEmpty: {
            errorMessage: 'Bar code cannot be empty'
        },
        isLength: {
            options: { min: 8, max: 13 },
            errorMessage: 'Bar code must be between 8 and 13 characters'
        }
    },
    name: {
        exists: {
            errorMessage: 'Product name is required'
        },
        isString: {
            errorMessage: 'Product name must be a string'
        },
        trim: true,
        notEmpty: {
            errorMessage: 'Product name cannot be empty'
        },
        isLength: {
            options: { min: 3, max: 100 },
            errorMessage: 'Product name must be between 3 and 100 characters'
        }
    },
    description: {
        exists: {
            errorMessage: 'Description is required'
        },
        isString: {
            errorMessage: 'Description must be a string'
        },
        trim: true,
        notEmpty: {
            errorMessage: 'Description cannot be empty'
        },
        isLength: {
            options: { min: 10, max: 500 },
            errorMessage: 'Description must be between 10 and 500 characters'
        }
    },
    unitPrice: {
        exists: {
            errorMessage: 'Unit price is required'
        },
        isFloat: {
            options: { min: 0.01 },
            errorMessage: 'Unit price must be a positive number'
        }
    },
    expireDate: {
        optional: true,
        isISO8601: {
            errorMessage: 'Invalid expiration date format. Use ISO8601 format (YYYY-MM-DD)'
        },
        custom: {
            options: (value) => {
                if (value) {
                    const expirationDate = new Date(value);
                    const today = new Date();
                    if (expirationDate <= today) {
                        throw new Error('Expiration date must be in the future');
                    }
                }
                return true;
            }
        }
    },
    weight: {
        exists: {
            errorMessage: 'Weight is required'
        },
        isFloat: {
            options: { min: 0.01 },
            errorMessage: 'Weight must be a positive number'
        }
    },
    limit: {
        exists: {
            errorMessage: 'Limit is required'
        },
        isInt: {
            options: { min: 1 },
            errorMessage: 'Limit must be a positive integer'
        }
    },
    productStatus: {
        exists: {
            errorMessage: 'Product status is required'
        },
        isBoolean: {
            errorMessage: 'Product status must be a boolean'
        }
    },
    unitMeasure: {
        exists: {
            errorMessage: 'Unit measure is required'
        },
        isIn: {
            options: [['Piece', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Meter', 'Centimeter', 'Inch', 'Pack', 'Box']],
            errorMessage: 'Invalid unit measure'
        }
    },
    category: {
        exists: {
            errorMessage: 'Category is required'
        },
        isMongoId: {
            errorMessage: 'Invalid category ID format'
        }
    },
    'branches.*': {
        exists: {
            errorMessage: 'At least one branch is required'
        },
        isMongoId: {
            errorMessage: 'Invalid branch ID format'
        }
    }
};

const updateProductImageSchema = {
    productId: {
        in: ['params'],
        exists: {
            errorMessage: 'Product ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid product ID format'
        }
    },
    image: {
        in: ['files'],
        custom: {
            options: (value, { req }) => {
                if (!req.file) {
                    throw new Error('Image file is required');
                }
                // Validar tipos de archivo permitidos
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                if (!allowedTypes.includes(req.file.mimetype)) {
                    throw new Error('Only JPEG, PNG and JPG files are allowed');
                }
                // Validar tamaño máximo (5MB)
                const maxSize = 5 * 1024 * 1024;
                if (req.file.size > maxSize) {
                    throw new Error('File size cannot exceed 5MB');
                }
                return true;
            }
        }
    }
};

const getBranchProductsSchema = {
    branchId: {
        in: ['params'],
        exists: {
            errorMessage: 'Branch ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid branch ID format'
        }
    }
};

module.exports = {
    validateCreateProduct: checkSchema(createProductSchema),
    validateUpdateProductImage: checkSchema(updateProductImageSchema),
    validateGetBranchProducts: checkSchema(getBranchProductsSchema)
};