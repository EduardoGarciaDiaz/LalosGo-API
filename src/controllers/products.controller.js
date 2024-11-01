const ProductsService = require('../services/products.service');

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