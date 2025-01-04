const CartService = require('../services/carts.service.js');
const CART_STATUS = 'reserved';
const { validationResult } = require('express-validator');

const creteCart = async (req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        let {userId, productForCart, branchId} = req.body
        let operationResult = await CartService.saveProductInCart(userId, productForCart, branchId)
        
        return res.status(200).send({
            message: "Producto agregado correctamente al carrito",
            cart: operationResult
        });
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const getCart = async (req, res, next) => { 
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        const userId = req.params.userId;
        const status = req.query.status;

        const result = await CartService.getCart(userId, status);

        return res.status(200).send({
            message: "Carrito recuperado",
            cart: result
        });
        
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const deleteCart = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        const orderId = req.params.orderId;
        const status = req.query.status;

        let result = await CartService.deleteCart(orderId, status);

        if (!result) {
            throw {
                status: 404,
                message: "Carrito no encontrado"
            };
        }

        return res.status(200).send({
            message: "Carrito eliminado"
        });
        
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const updateCartQuantities = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        const orderId = req.params.orderId;
        const status = req.query.status;
        const { productId, quantity, branchId } = req.body;

        const newCartInfo = {
            productId,
            quantity,
            branchId
        }

        let result;
        
        if (status == 'reserved') {
            result = await CartService.updateCartQuantities(orderId, status, newCartInfo);
        }

        return res.status(200).send({
            message: "Carrito actualizado",
            cart: result.cart,
            maxStock: result.maxStock,
            hasStock: result.hasStock
        });
        
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({
                    message: error.message, 
                    maxStock: error.maxStock,
                    success: false
                });
        }
        next(error);
    }
}

const getMainCartDetails = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }
        
        const userId = req.params.userId;
        const status = req.query.status;

        const result = await CartService.getMainCartDetails(userId, status);

        if (!result) {
            throw {
                status: 404,
                message: "Carrito no encontrado"
            };        
        }

        return res.status(200).send({
            message: "Precio del carrito recuperado",
            cartSummary: result
        });

    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({
                    message: error.message, 
                    maxStock: error.maxStock,
                    success: false
                });
        }
        next(error);
    }
}

module.exports = {
    creteCart,
    getCart,
    deleteCart,
    updateCartQuantities,
    getMainCartDetails
}
