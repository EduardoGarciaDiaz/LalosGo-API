const mongoose = require('mongoose')
const CategorySchema = require('../models/Category')

const ACTIVE_CATEGORY = true;
const INACTIVE_CATEGORY = false;

const saveCategory = async(identifier, name) => {
    try {
        const repeatedCategory = await CategorySchema.findOne({$or: [{ name: name },{ identifier: identifier }]});
        if(repeatedCategory){
            throw {
                status: 400,
                message: "La categoría ya se encuentra registrada"
            }
        }

        const newCategory = new CategorySchema({
            identifier,
            name,
            categoryStatus: ACTIVE_CATEGORY
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

        let savedCategory = await CategorySchema.findOneAndUpdate({_id: categoryUpdate._id}, {$set: categoryUpdate}, {new: true})
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

        let savedCategory = await CategorySchema.findOneAndUpdate({_id: categoryUpdate._id}, {$set: categoryUpdate}, {new: true})
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

const consultCategories = async() => {
    try {
        let categoriesFound = await CategorySchema.find();
        if(!categoriesFound){
            throw {
                status: 404,
                message: "No hay categorias actualmente."
            }
        }
        return categoriesFound
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
    updateCategoryStatus, 
    consultCategories
}