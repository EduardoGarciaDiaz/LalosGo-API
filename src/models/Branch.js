const mongoose = require('mongoose')
const model = mongoose.model

branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    openingHour: {
        type: String, //#Formato 24:00
        required: true
    },
    closingTime: {
        type: String, //#Formato 24:00
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
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
    }],
},
{
    timeseries: true,
    versionKey: false
})

module.exports = model("branches", branchSchema)