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
    statusOrder: {
        type: String,
        enum: ['pending', 'in process', 'on delivery', 'delivered'], //REVISAR LOS ESTADOS DE UNA ORDEN, SI SON ESTOS????
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

module.exports = model("orders", orderSchema)