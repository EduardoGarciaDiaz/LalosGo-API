const { checkSchema } = require('express-validator');

const incidentIdParamSchema = {
    id: {
        in: ['params'],
        exists: {
            errorMessage: 'Incident ID is required'
        },
        isMongoId: {
            errorMessage: 'Invalid Incident ID format'
        }
    }
};

const createIncidentSchema = {
    description: {
        exists: {
            errorMessage: 'Description is required'
        },
        isString: {
            errorMessage: 'Description must be a string'
        },
        notEmpty: {
            errorMessage: 'Description cannot be empty'
        },
        trim: true,
        isLength: {
            options: { min: 10, max: 500 },
            errorMessage: 'Description must be between 10 and 500 characters'
        }
    },
    date: {
        exists: {
            errorMessage: 'Date is required'
        },
        custom: {
            options: (value) => {
                const incidentDate = new Date(value);
                const today = new Date();
                if (incidentDate > today) {
                    throw new Error('Incident date cannot be in the future');
                }
                return true;
            }
        }
    },
    orderNumber: {
        optional: false,
        isMongoId: {
            errorMessage: 'Invalid Order ID format'
        }
    },
    file: {
        custom: {
            options: (value, { req }) => {
                if (!req.file) {
                    throw new Error('Image file is required');
                }

                // Validate file mime type
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
                if (!allowedMimes.includes(req.file.mimetype)) {
                    throw new Error('Only JPG, PNG and GIF files are allowed');
                }

                // Validate file size (e.g., max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (req.file.size > maxSize) {
                    throw new Error('File size cannot exceed 5MB');
                }

                return true;
            }
        }
    }
};

const getIncidentSchema = {
    ...incidentIdParamSchema
};

const getIncidentPhotoSchema = {
    ...incidentIdParamSchema
};

module.exports = {
    validateCreateIncident: checkSchema(createIncidentSchema),
    validateGetIncident: checkSchema(getIncidentSchema),
    validateGetIncidentPhoto: checkSchema(getIncidentPhotoSchema)
};