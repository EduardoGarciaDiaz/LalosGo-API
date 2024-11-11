const mongoose = require('mongoose')
const model = mongoose.model

incidentSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    photo: {
        type: Buffer,
        required: true
    },
    orderNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
    },
    date: {
        type: Date,
        required: true,
    }
},
{
    timeseries: true,
    versionKey: false
})

module.exports = model("incidents", branchSchema)