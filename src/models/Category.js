const mongoose = require('mongoose')
const model = mongoose.model

categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    categoryStatus: {
        type: String,
        enum:['Active', 'Inactive'],
        required: true 
    }
},
{
    timestamps: true,
    versionKey: false
})

module.exports = model("categories",categorySchema)