const CartService = require('../services/carts.service.js');

const getCart = async (req, res, next) => { 
    try {
        const userId = req.params.userId;
        const status = req.query.status;

        if (!userId) {
            throw {
                status: 400,
                message: "Falta el id del usuario"
            };
        }

        if (status === undefined || status !== 'reserved') {
            throw {
                status: 400,
                message: "El estado de la orden no es corresponde a un carrito"
            };
        }

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
        const userId = req.params.userId;
        const status = req.query.status;

        await CartService.deleteCart(userId, status);

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
        const userId = req.params.userId;
        const status = req.query.status;
        const { productId, quantity } = req.body;

        const newCartInfo = {
            productId,
            quantity
        }

        let result;
        
        if (status === 'reserved') {
            result = await CartService.updateCartQuantities(userId, status, newCartInfo);
        }

        return res.status(200).send({
            message: "Carrito actualizado",
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

module.exports = {
    getCart,
    deleteCart,
    updateCartQuantities
}
