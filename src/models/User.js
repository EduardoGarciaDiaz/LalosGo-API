const mongoose = require('mongoose')
const model = mongoose.model

const clientSchema = new mongoose.Schema({
    addresses: [{
        street: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true
        },
        cologne: {
            type: String,
            required: true
        },
        zipcode: {
            type: Number,
            required: true
        },
        locality: {
            type: String,
            required: true
        },
        federalEntity: {
            type: String,
            required: true
        },
        internalNumber: {
            type: Number,
            required: false
        },
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        latitude: {
            type: Number,
            required: true
        }, 
        longitude: {
            type: Number, 
            required: true
        },
        isCurrentAddress: {
            type: Boolean
        }
    }],
    paymentMethods: [{
        cardOwner: { 
            type: String,
            required: true
        },
        cardNumber: {
            type: String,
            required: true
        },
        cardEmitter: {
            type: String,
            required: false
        },
        expirationDate: {
            type: String,
            required: true,
        },
        cardType: {
            type: String,
            enum: ['Débito', 'Crédito'],
            required: true
        },
        paymentNetwork: {
            type: String,
            enum: ['Visa', 'MasterCard'],
            required: true
        }
    }]    
})



const employeeSchema = new mongoose.Schema({
    role: {
        type: String,
        enum:['Manager', 'Delivery Person', 'Sales Executive' ],
        required: true
    },
    hiredDate:{
        type : Date,
        required: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branches',
        required: true
    }
})


userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
        index: true,
    },
    fullname: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value <= new Date(),
            message: 'Birthdate cannot be in the future.'
        }
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },   
    status: {
        type: String,
        enum:['Active', 'Inactive'],
        required: true,
    },
    client: {
        type: clientSchema,
    },
    employee: {
        type: employeeSchema,
    }    
},
{
    timestamps: true,
    versionKey: false
})



module.exports = model("users", userSchema)