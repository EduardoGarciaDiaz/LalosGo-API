const mongoose = require('mongoose')
const model = mongoose.model

branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    openingHour: {
        type: Date,
        required: true
    },
    closingTime: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
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