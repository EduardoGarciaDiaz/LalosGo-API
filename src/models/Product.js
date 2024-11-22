const mongoose = require('mongoose')
const model = mongoose.model

productSchema = new mongoose.Schema({
    barCode: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    expireDate: {
        type: Date,
        required: false
    },
    image: {
        type: Buffer
    },
    weight: {
        type: Number,
        required: true
    },
    productStatus: {
        type: String,
        enum:['Active', 'Inactive'],
        required: true 
    },
    unitMeasure: {
        type: String,
        enum:['Piece', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Meter', 'Centimeter', 'Inch', 'Pack', 'Box'],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    }
},
{
    timestamps: true,
    versionKey: false
})

module.exports = model("products", productSchema)