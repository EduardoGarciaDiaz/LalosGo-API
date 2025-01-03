const mongoose = require('mongoose')
const ProductSchema = require('../models/Product')
const BranchSchema = require('../models/Branch')
const Product = require('../models/Product')

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
        let savedProduct = await productToSave.save()
        
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

const updateProduct = async(productToUpdate) => {
    try {
        let foundProduct = await ProductSchema.findOne({$or: [{_id: productToUpdate._id}, {barCode: productToUpdate.barCode}]})
        if(!foundProduct){
            throw{
                status: 400,
                message: "El producto no se encuentra registrado."
            }
        }
        
        let savedProduct = await ProductSchema.findByIdAndUpdate(
            foundProduct._id, 
            {
                $set:{
                    name: productToUpdate.name,
                    description: productToUpdate.description,
                    unitPrice: productToUpdate.unitPrice,
                    expirateDate: productToUpdate.expirateDate,
                    weigth: productToUpdate.weigth,
                    limit: productToUpdate.limit,
                    unitMeasure: productToUpdate.unitMeasure,
                    category: productToUpdate.category
                }
            },
        );
        if(savedProduct){
            return savedProduct
        }

        throw{
            status: 400,
            message: "El producto no se pudo actualizar."
        }
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

const updateProductInBranches = async (branches, productToUpdate) => {
    try {
        if (!Array.isArray(branches)) {
            throw {
                status: 400,
                message: "El parámetro 'branches' debe ser un arreglo de objetos.",
            };
        }

        const updatedBranches = await Promise.all(
            branches.map(async (branchToUpdate) => {
                const branch = await BranchSchema.findById(branchToUpdate.id);

                if (!branch) {
                    throw {
                        status: 404,
                        message: `La rama con ID ${branchToUpdate.id} no fue encontrada.`,
                    };
                }

                const existingProductIndex = branch.branchProducts.findIndex(
                    (item) => item.product.toString() === productToUpdate.id.toString()
                );

                if (existingProductIndex !== -1) {
                    branch.branchProducts[existingProductIndex].quantity =
                        branchToUpdate.quantity || 0;
                } else {
                    branch.branchProducts.push({
                        product: productToUpdate.id,
                        quantity: branchToUpdate.quantity || 0,
                    });
                }
                return await branch.save();
            })
        );

        const branchIds = branches.map((branch) => branch.id);
        await BranchSchema.updateMany(
            { _id: { $nin: branchIds }, "branchProducts.product": productToUpdate.id },
            { $pull: { branchProducts: { product: productToUpdate.id } } }
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



const consultBranchProducts = async(branchId) => {
    try {
        let  foundBranches  = await BranchSchema.findById(branchId).populate({
            path:'branchProducts.product',
            match: { productStatus: true},
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

        foundBranches.branchProducts = foundBranches.branchProducts.filter(bp => bp.product !== null);

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

const getProducts = async () => {
    try{
        const products = await ProductSchema.find().populate('category')

        if (!products || products.length === 0) {
            throw {
                status: 404,
                message: "No se encontraron productos registrados"
            }
        }

        return products
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

const consultBranchProductsByCategory = async (branchId, categoryId) => {
    try {
        if (!branchId || !categoryId) {
            throw {
                status: 400,
                message: "branchId y categoryId son requeridos"
            };
        }

        const foundBranch = await BranchSchema.findById(branchId).populate({
            path: 'branchProducts.product',
            match: { productStatus: true, category: categoryId },
            populate: {
                path: 'category',
                model: 'categories'
            }
        });

        if (!foundBranch || !foundBranch.branchProducts || foundBranch.branchProducts.length === 0) {
            throw {
                status: 404,
                message: "No se encontraron productos"
            };
        }
        const filteredProducts = foundBranch.branchProducts.filter(bp => bp.product);

        return filteredProducts;

    } catch (error) {
        throw error.status
            ? { status: error.status, message: error.message }
            : { status: 500, message: "Error interno del servidor" };
    }
};


const patchProduct = async(productId, productStatus) => {
    try {
       const updateProduct = await Product.findByIdAndUpdate(
            productId, 
            { productStatus}, 
            { new: true, }
       );

       if(!updateProduct){
           throw{
               status: 404,
               message: "El producto no se encuentra registrado."
           }
       }

       return updateProduct;

    } catch (error){
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error
    }
}

const getProductById = async (productId) => {
    try{
        const product = await ProductSchema.findById(productId).populate('category')

        if (!product || product.length === 0) {
            throw {
                status: 404,
                message: "No se encontraron productos registrados"
            }
        }

        return product
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
    consultBranchProducts, 
    getProducts, 
    patchProduct,
    consultBranchProductsByCategory,
    updateProductInBranches,
    updateProduct,
    getProductById
}