const mongoose = require('mongoose')
const model = mongoose.model

categorySchema = new mongoose.Schema({
    identifier:{
        type: String,
        required: true,
        unique: true,
        index: true
    },
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
    timeseries: true,
    versionKey: false
})

module.exports = model("categories",categorySchema)