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
        municipality : {
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
        coordinates: {
            type: [Number],
            required: true
        }
    }],
    paymentMethods: [{
        cardOwner: { 
            type: String,
            required: true
        },
        cardNumber: {
            type: Number,
            required: true
        },
        cardEmitter: {
            type: String,
            required: false
        },
        expirationDate: {
            type: String, // Formato MM/YY
            required: true,
        },
        cvv: {
            type: Number,
            required: true,
        },
        cardType: {
            type: String,
            enum: ['Debit', 'Credit'],
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
    }
})


userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: false,
        indexe: true
    },   
    status: {
        type: String,
        enum:['Active', 'Inactive'],
        required: true
    },
    client: {
        type: clientSchema,
        required: false
    },
    employee: {
        type: employeeSchema,
        required: false
    }    
},
{
    timeseries: true,
    versionKey: false
})

module.exports = model("users", userSchema)