const Order = require('../models/Order');
const Product = require('../models/Product');
const Branch = require('../models/Branch');
const CART_STATUS = 'reserved';
const SHIPPING_COST = 50;

const getCart = async (userId, status) => {
    try {
        if (status !== undefined && status === CART_STATUS) {

            const cartOrder = await Order.findOne({ customer: userId, statusOrder: status })
            .populate({
                path: 'orderProducts.product'
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

const deleteCart = async (orderId, status) => {
    try {
        if (status !== undefined && status === CART_STATUS) {
            await Order.deleteOne({ _id: orderId, statusOrder: status });

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

const updateCartQuantities = async (orderId, status, newCartInfo) => {
    try {
        if (status !== undefined && status === CART_STATUS) {
            const { productId, quantity } = newCartInfo;
            const cartOrder = await Order.findOne({ _id: orderId, statusOrder: status })
                .populate({
                    path: 'orderProducts.product',
                });
            
            if (cartOrder.orderProducts.length > 0) {
                const productIndex = cartOrder.orderProducts.findIndex(
                    product => product.product._id.toString() === productId.toString()
                );
                                
                if (productIndex >= 0) {
                    if (quantity > 0) {
                        const stockResult = await isStockAvailable(newCartInfo);
                        
                        if (stockResult.maxStock === 0) {
                            cartOrder.orderProducts.splice(productIndex, 1);
                        } else if (stockResult.hasStock) {
                            cartOrder.orderProducts[productIndex].quantity = quantity;
                        } else {
                            cartOrder.orderProducts[productIndex].quantity = stockResult.maxStock;
                        }
                        
                        await cartOrder.save();

                        if (cartOrder.orderProducts.length === 0) {
                            await cartOrder.deleteOne();
                            return { cart: "Carrito eliminado" };
                        }

                        const updatedCart = await Order.findById(cartOrder._id)
                            .populate({
                                path: 'orderProducts.product',
                            });
                        
                        return {cart: updatedCart, maxStock: stockResult.maxStock, hasStock: stockResult.hasStock};
                    }
                }
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

const getCartPrice = async (userId, status) => {
    try {
        if (status === undefined && status !== CART_STATUS) {
            throw {
                status: 400,
                message: "El estado de la orden no pertenece a un carrito"
            };
        }

        const cart = await Order.findOne({ 
            customer: userId,
            statusOrder: status
        });

        if (!cart) {
            throw {
                status: 404,
                message: "Carrito no encontrado o no pertenece al usuario"
            };
        }

        let finalPrice = 0.00;

        cart.orderProducts.forEach(element => {
            let productPrice = element.quantity * element.price;
            finalPrice = finalPrice + productPrice;
        });

        finalPrice += SHIPPING_COST;

        return {
            totalPrice: finalPrice,
            orderId: cart._id
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

async function isStockAvailable(newCartInfo) {
    try {
        const { productId, quantity, branchId } = newCartInfo;
    
        const branch = await Branch.findOne(
            { 
                _id: branchId,
                'branchProducts.product': productId 
            },
            { 
                'branchProducts.$': 1 
            }
        );

        if (!branch || !branch.branchProducts.length) {
            throw {
                status: 400,
                message: "Producto no encontrado en la sucursal"
            }
        }

        const availableQuantity = branch.branchProducts[0].quantity;

        if (quantity > availableQuantity) {
            return {
                hasStock: false,
                maxStock: availableQuantity
            };
        }

        return {
            hasStock: true,
            maxStock: availableQuantity
        };
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
    updateCartQuantities,
    getCartPrice
}