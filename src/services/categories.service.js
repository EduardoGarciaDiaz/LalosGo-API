const mongoose = require('mongoose')
const CategorySchema = require('../models/Category')

const ACTIVE_CATEGORY = 'Active';
const INACTIVE_CATEGORY = 'Inactive';

const saveCategory = async(identif, categoryName) => {
    try {
        const repeatedCategory = await CategorySchema.findOne({$or: [{ name: name },{ _id: id }]});
        if(repeatedCategory){
            throw {
                status: 400,
                message: "La categoría ya se encuentra registrada"
            }
        }

        const newCategory = new CategorySchema({
            identif,
            categoryName,
            ACTIVE_CATEGORY
        })
        const savedCategory = await newCategory.save();
        const foundCategory = await CategorySchema.findById(savedCategory._id)
        return foundCategory;
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

const updateCategory = async(categoryUpdate) => {
    try {
        let foundCategory = await CategorySchema.findById(categoryUpdate._id)
        if(!foundCategory){
            throw {
                status: 404,
                message: "La categoría que quieres editar no existe"
            }
        }

        let savedCategory = await CategorySchema.findOneAndUpdate({_id: accommodation._id}, {$set: categoryUpdate}, {new: true})
        foundCategory = await CategorySchema.findById(savedCategory._id)

        return foundCategory;


    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

const updateCategoryStatus = async(categoryUpdate) => {
    try {
        let foundCategory = await CategorySchema.findById(categoryUpdate._id)
        if(!foundCategory){
            throw {
                status: 404,
                message: "La categoría que quieres editar no existe"
            }
        }

        ///validar si es activar o inactivas, para validar si hay pedidos pendiente, y luego activar o desactivar los productos.

        let savedCategory = await CategorySchema.findOneAndUpdate({_id: accommodation._id}, {$set: categoryUpdate}, {new: true})
        foundCategory = await CategorySchema.findById(savedCategory._id)

        return foundCategory;


    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

module.exports = {
    saveCategory,
    updateCategory,
    updateCategoryStatus
}