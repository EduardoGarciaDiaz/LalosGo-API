const Order = require('../models/Order');
const Product = require('../models/Product');
const CART_STATUS = 'reserved';

const getCart = async (userId, status) => {
    try {
        if (status !== undefined && status === CART_STATUS) {

            const cartOrder = await Order.findOne({ customer: userId, statusOrder: status })
            .populate({
                path: 'orderProducts.product',
                select: '-password'
            });

            return cartOrder;
        }
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

const deleteCart = async (userId, status) => {
    try {
        if (status !== undefined && status === CART_STATUS) {
            await Order.deleteOne({ customer: userId, statusOrder: status });

            return;
        }
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

const updateCartQuantities = async (userId, status, newCartInfo) => {
    try {
        if (status !== undefined && status === CART_STATUS) {
            const { productId, quantity } = newCartInfo;
            const cartOrder = await Order.findOne({ customer: userId, statusOrder: status })

            if (cartOrder.orderProducts.length > 0) {
                const productIndex = cartOrder.orderProducts.findIndex(
                    product => product.product.toString() === productId.toString()
                );
                
                if (productIndex >= 0) {
                    if (quantity === 0) {
                        cartOrder.orderProducts.splice(productIndex, 1);  
                    } else {
                        cartOrder.orderProducts[productIndex].quantity = quantity;
                    }
                }
                
                await cartOrder.save();
                return cartOrder;
            }             

            throw {
                status: 400,
                message: "Producto no encontrado en el carrito"
            }
        }
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
    getCart,
    deleteCart,
    updateCartQuantities
}