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
        type: Boolean,
        required: true 
    }
},
{
    timestamps: true,
    versionKey: false
})

module.exports = model("categories",categorySchema)