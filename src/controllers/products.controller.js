const ProductsService = require('../services/products.service');
const ProductService = require('../services/products.service')


const createProduct = async (req, res, next) => {
    try {
        let {barCode, name, description, unitPrice, expireDate, weight, productStatus, unitMeasure, category} = req.body
        let {branches} = req.body
        let newProduct = {
            barCode,
            name,
            description,
            unitPrice,
            expireDate,            
            weight,
            productStatus,
            unitMeasure,
            category
        }
        let productSaved = await ProductService.saveNewProduct(newProduct)
        if(productSaved){
            await ProductService.saveProductInBranch(branches, productSaved)
            return res.status(201).send({
                message:"Producto creado exitosamente.",
                branch: productSaved  
            })
        }
        return res.status(400).send({
            message:"Ocurrio un probema al guardar el producto, contacte a su prestador del servicio.",
            branch: productSaved  
        })
    } catch (error) {
        console.log(error)
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const getAllProducts = async (req, res, next) => {
    try {
        // TODO
        // const result = await ProductsService.getAllProducts();
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }

        next(error)
    }
}

module.exports = {
    createProduct
}