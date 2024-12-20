const mongoose = require('mongoose')
const model = mongoose.model

incidentSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true
    },
    mime: {
        type: String,
        required: true
    },    
    date: {
        type: Date,
        required: true,
    },
    orderNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
    }

},
{
    timestamps: true,
    versionKey: false
})

module.exports = model("incidents", incidentSchema)