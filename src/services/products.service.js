const mongoose = require('mongoose')
const ProductSchema = require('../models/Product')
const BranchSchema = require('../models/Branch')

const saveNewProduct = async(newProduct) => {
    try {
        let repetedProdcut = await ProductSchema.findOne({$or: [{_id: newProduct._id}, {name: newProduct.name}, {barCode: newProduct.barCode}]})
        if(repetedProdcut){
            throw{
                status: 400,
                message: "El producto ya se encuentra registrado."
            }
        }
        let productToSave = new ProductSchema(newProduct)
        let savedProduct = productToSave.save()
        return savedProduct
         
    } catch (error) {
        if(error.status){
            throw{
                status: error.status,
                message: error.message
            }
        }
        throw error
    }
}



const saveProductInBranch = async (branches, productToAdd) => {
    try {
        if (!Array.isArray(branches)) {
            throw {
                status: 400,
                message: "El parámetro 'branches' debe ser un arreglo de IDs.",
            };
        }
        const updatedBranches = await Promise.all(
            branches.map(async (branchToUpdate) => {
                /*let foundBranch = await BranchSchema.findById(branchToUpdate.id);
                if (!foundBranch) {
                    throw {
                        status: 404,
                        message: `La sucursal ${branchToUpdate.name} no existe.`,
                    };
                }*/

                return await BranchSchema.findByIdAndUpdate(
                    branchToUpdate.id,
                    {
                        $addToSet: { 
                            branchProducts: {
                                product: productToAdd,
                                quantity: branches.find(branch => branch.id === branchToUpdate.id)?.quantity || 0
                        } },
                    },
                    { new: true, useFindAndModify: false }
                );
            })
        );

        return updatedBranches; 
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message,
            };
        }
        throw error;
    }
};



const getAllProducts = async () => {
    try {
        // TODO
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
    saveNewProduct,
    saveProductInBranch
}