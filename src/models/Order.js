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
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branches',
    },
    orderProducts: [{
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
    deliveryPerson:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    statusOrder: {
        type: String,
        enum: ['reserved', 'pending', 'approved', 'in transit', 'delivered', 'not delivered', 'canceled'],
        required: true,
        default: 'reserved' 
    },
    paymentMethod: {
        type: String,
        required: true
    }
},
{
    timestamps: true,
    versionKey: false
})

module.exports = model("orders", orderSchema)