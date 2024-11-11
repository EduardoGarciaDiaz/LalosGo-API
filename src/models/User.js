const mongoose = require('mongoose')
const model = mongoose.model

userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    birthdate: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
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
    paymentMethods: {
        type: [String],
        default: []
    }
},
{
    timeseries: true,
    versionKey: false
})

module.exports = model("users", userSchema)