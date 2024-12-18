const Order = require('../models/Order');
const CART_STATUS = 'reserved';

const getOrders = async (userId, status) => {
    try {
        // Get user cart order
        if (status !== undefined && status === CART_STATUS) {
            const cartOrder = await Order.find({ customer: userId, statusOrder: status })
            //TODO:
            // .populate({
            //     path: 'orderProducts',
            //     select: '-password'
            // });

            return cartOrder;
        }

        // Get user orders by status
        if (status !== undefined) {
            const userOrders = await Order.find({ customer: userId, statusOrder: status })

            return userOrders;
        }

        // Get all orders
        if (userId === undefined || userId === null || userId === '') {
            const allOrders = await Order.find()
            .populate({
                path: 'orderProducts.product',
                select: '-password'
            });

            return allOrders;
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
    getOrders
}