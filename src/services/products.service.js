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

const saveProductImage = async(productId, imageUrl, imageAssetId)=>{
    try {
        let foundProduct = await ProductSchema.findById(productId)
        if(!foundProduct){
            throw{
                status: 404,
                message: "El producto no se encuentra guardado, agreguelo."
            }
        }
        let productToEdit = await ProductSchema.findByIdAndUpdate(
            productId, 
            {
                $set:{
                    image: imageUrl,
                    imageId: imageAssetId
                }
            },
            { new: true, useFindAndModify: false }
        )
        return productToEdit
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message,
            };
        } 
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


const consultBranchProducts = async(branchId) => {
    try {
        let  foundBranches  = await BranchSchema.findById(branchId).populate({
            path:'branchProducts.product',
            populate: {
                path: 'category',
                model: 'categories'
            }
        })
        
        if (!foundBranches || foundBranches.length === 0) {
            throw {
                status: 404,
                message: "No se encontraron sucursales registradas"
            }
        }

        return foundBranches;

    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error
    }
}



module.exports = {
    saveNewProduct,
    saveProductInBranch,
    saveProductImage,
    consultBranchProducts
}