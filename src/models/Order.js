const mongoose = require('mongoose')
const model = mongoose.model

orderSchema = new mongoose.Schema({
    orderNumber: {
        type: Number,
        required: true,
        unique: true
    },
    orderDate: {
        type: Date,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true,
    },
    totalPrice: {
        type: String,
        required: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branches',
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    status: {
        type: String,
        required: true,
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true
    }
},
{
    timeseries: true,
    versionKey: false
})

module.exports = model("orders", branchSchema)