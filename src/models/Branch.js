const mongoose = require('mongoose')
const model = mongoose.model

branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    openingTime: {
        type: String,
        required: true
    },
    closingTime: {
        type: String,
        required: true,
    },
    address: {
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
        location:{
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }       
    },
    branchStatus: {
        type: Boolean,
        required: true 
    },
    branchProducts: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
},
{
    timestamps: true,
    versionKey: false
})

module.exports = model("branches", branchSchema)