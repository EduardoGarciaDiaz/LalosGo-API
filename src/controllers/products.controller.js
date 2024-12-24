const ProductsService = require('../services/products.service');
const ProductService = require('../services/products.service');
require('dotenv').config();
const multer = require('multer');
const cloudinary = require('../cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image');


const createProduct = async (req, res, next) => {
    try {
        let { barCode, name, description, unitPrice, expireDate, image, weight, limit, productStatus, unitMeasure, category } = req.body;
        let { branches } = req.body;
        let newProduct = {
            barCode,
            name,
            description,
            unitPrice,
            expireDate,
            image,
            weight,
            limit,
            productStatus,
            unitMeasure,
            category
        };

        let productSaved = await ProductService.saveNewProduct(newProduct);
        if (productSaved) {
            await ProductService.saveProductInBranch(branches, productSaved);
            return res.status(201).send({
                message: "Producto creado exitosamente.",
                product: productSaved
            });
        }
        return res.status(400).send({
            message: "Ocurrió un problema al guardar el producto, contacte a su prestador del servicio.",
            product: productSaved
        });
    } catch (error) {
        console.log(error);
        if (error.status) {
            return res.status(error.status).send({ message: error.message });
        }
        next(error);
    }
}

const updateProductImage = async (req, res, next) => {
    
    try {
        let productId = req.params.productId;
        upload(req, res, async (err) => {
            if (err) {
                console.log("Error con Multer:", err);
                return next({ status: 500, message: "Error al subir la imagen, puede intentarlo desde el apartado -Edicion Producto-"  });
            }
            const imageFile = req.file;

            if (!imageFile) {
                return next({ status: 400, message: "No se ha proporcionado una imagen, puede intentarlo desde el apartado -Edicion Producto-" });
            }
            
            try {
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { resource_type: 'auto' },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            }
                            resolve(result);
                        }
                    ).end(imageFile.buffer);
                });
                
                
                const imageUrl = result.secure_url;
                const imageId = result.asset_id;

                let product = await ProductService.saveProductImage(productId, imageUrl, imageId);
                if (!product) {
                    return next({ status: 400, message: "Error al actualizar el producto en la base de datos, puede intentarlo desde el apartado -Edicion Producto-" });
                }

                return res.status(200).send({
                    message: "Imagen guardada correctamente",
                    product: product
                });
            } catch (error) {
                return next({ status: 500, message: "Error al procesar la imagen, puede intentarlo desde el apartado -Edicion Producto-", error: error.message });
            }
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).send({ message: error.message });
        }
        next(error);
    }
};


const getBranchProducts = async (req, res, next) => {
    try {
        let {branchId} = req.params
        let productsOfBranch = await ProductService.consultBranchProducts(branchId)
    
        return res.status(201).send({
            message: `Productos de la sucursal recuperados exitosamente`,
            branch: productsOfBranch
        });    

    } catch (error) {
        if (error.status) {
            return res.status(error.status).send({ message: error.message });
        }
        next(error);
    }
}

const getProducts = async (req, res, next) => { 
    try{
        const products = await ProductsService.getProducts();

        return res.status(200).send({
            message: "Productos recuperados exitosamente",
            products: products
        });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).send({ message: error.message });
        }
        next(error);
    }
}

const patchProduct = async (req, res, next) => {
    try{

        let productId = req.params.productId;
        let {newStatus} = req.body;

        const producStatusChanged = await ProductsService.patchProduct(productId, newStatus);

        return res.status(200).send({
            message: "Estado del producto actualizado exitosamente",
            product: producStatusChanged
        });

    } catch (error) {
        if(error.status){
            return res.status(error.status).send({ message: error.message });
        }
        next(error);
    }
}

module.exports = {
    createProduct,
    updateProductImage,
    getBranchProducts, 
    getProducts, 
    patchProduct
}
