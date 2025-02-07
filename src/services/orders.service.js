const Order = require('../models/Order');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { patch } = require('../v1/routes/cart.routes');

const cartToOrder = async (orderDetails) => {
    try {
        if (!orderDetails) {
            throw {
                status: 400,
                message: "Faltan datos"
            };
        }

        const order = await Order.findOne({
            _id: orderDetails.orderId,
            customer: orderDetails.customer
        }).exec();

        if (!order) {
            throw {
                status: 404,
                message: "Carrito no encontrado o no pertenece al usuario"
            };
        }

        order.set({
            orderDate: orderDetails.orderDate,
            totalPrice: orderDetails.totalPrice,
            branch: orderDetails.branch,
            statusOrder: orderDetails.statusOrder,
            paymentMethod: orderDetails.paymentMethod
        });

        return await reserveCartProducts(order);

    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
};

async function reserveCartProducts(order) {
    let productUpdates = [];

    try {
        const branch = await Branch.findById(order.branch)
            .select('branchProducts')
            .lean()
            .exec();

        if (!branch) {
            throw {
                status: 404,
                message: "Sucursal no encontrada"
            };
        }

        productUpdates = order.orderProducts.map(orderProduct => {
            const branchProduct = branch.branchProducts.find(
                bp => bp.product.toString() === orderProduct.product.toString()
            );

            if (!branchProduct) {
                throw {
                    status: 400,
                    message: `Producto ${orderProduct.product} no disponible en la sucursal`
                };
            }

            if (branchProduct.quantity < orderProduct.quantity) {
                throw {
                    status: 409,
                    message: `Inventario insuficiente para el producto ${orderProduct.product.name}. Disponible: ${branchProduct.quantity}, Solicitado: ${orderProduct.quantity}`
                };
            }

            return {
                product: orderProduct.product,
                quantity: orderProduct.quantity,
                originalQuantity: branchProduct.quantity
            };
        });
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }

    try {
        const bulkOps = productUpdates.map(update => ({
            updateOne: {
                filter: {
                    _id: order.branch,
                    'branchProducts': {
                        $elemMatch: {
                            product: update.product,
                            quantity: { $gte: update.quantity }
                        }
                    }
                },
                update: {
                    $inc: { 'branchProducts.$.quantity': -update.quantity }
                }
            }
        }));

        const updateResult = await Branch.bulkWrite(bulkOps);

        if (updateResult.modifiedCount !== productUpdates.length) {

            await rollbackUpdates(order.branch, productUpdates);
            throw {
                status: 409,
                message: "No se pudo completar la operación debido a cambios en el inventario"
            };
        }

        await order.save();

        return await Order.findById(order._id)
            .populate('orderProducts.product')
            .exec();

    } catch (error) {
        await rollbackUpdates(order.branch, productUpdates);
        throw error.status ? error : {
            status: 500,
            message: "Error al procesar la orden"
        };
    }
}

async function rollbackUpdates(branchId, productUpdates) {
    try {
        const bulkOps = productUpdates.map(update => ({
            updateOne: {
                filter: {
                    _id: branchId,
                    'branchProducts.product': update.product
                },
                update: {
                    $set: { 'branchProducts.$.quantity': update.originalQuantity }
                }
            }
        }));

        await Branch.bulkWrite(bulkOps);
    } catch (error) {
        console.error('Error en rollback:', error);
    }
}

const getAllOrders = async function () {
    try {
        const orders = await Order.find({}).populate({
            path: 'orderProducts.product',
            select: 'image'
        });
        return orders;
    } catch (error) {
        throw error;
    }
}

const getAllOrdersByCustomer = async function (customerId) {
    try {
        const orders = await Order.find({ customer: customerId }).populate({
            path: 'orderProducts.product',
            select: 'image'
        });
        return orders;
    }
    catch (error) {
        throw error;
    }
}

const getAllOrdersByDeliveryPerson = async function (deliveryPersonId) {
    try {
        const orders = await Order.find({ deliveryPerson: deliveryPersonId }).populate({
            path: 'orderProducts.product',
            select: 'image'
        });

        return orders;
    }
    catch (error) {
        throw error;
    }
}

const getOrderByCustomer = async function (customerId, orderId) {
    try {
        const order = await Order.findOne({ customer: customerId, _id: orderId })
            .populate([
                { path: 'orderProducts.product' },
                {
                    path: 'branch',
                    select: 'address'
                },
                {
                    path: 'customer',
                    select: 'client.addresses'
                },
                {
                    path: 'deliveryPerson',
                    select: 'fullname'
                }
            ]);

        if (!order) {
            const error = new Error('Orden no encontrada');
            error.status = 404;
        }
        return order;

    } catch (error) {
        throw error;
    }
}

const getOrderByDeliveryPerson = async function (deliveryPersonId, orderId) {
    try {
        const order = await Order.findOne({ deliveryPerson: deliveryPersonId, _id: orderId })
            .populate([
                { path: 'orderProducts.product' },
                {
                    path: 'branch',
                    select: 'address'
                },
                {
                    path: 'customer',
                    select: 'client.addresses'
                }, 
                {
                    path: 'deliveryPerson',
                    select: 'fullname'
                }
            ]);

        if (!order) {
            const error = new Error('Orden no encontrada');
            error.status = 404;
        }
        return order;
    } catch (error) {
        throw error;
    }
}

const getOrder = async function (orderId) {
    try {
        const order = await Order.findById(orderId)
            .populate([
                { path: 'orderProducts.product' },
                {
                    path: 'branch',
                    select: 'address'
                },
                {
                    path: 'customer',
                    select: 'client.addresses'
                }, 
                {
                    path: 'deliveryPerson',
                    select: 'fullname'
                }
            ]);

        if (!order) {
            const error = new Error('Orden no encontrada');
            error.status = 404;
        }
        return order;
    }
    catch (error) {
        throw error;
    }
}

const updateStatus = async function (orderId, status) {
    try {
        updatedOrder = await Order.findOneAndUpdate({ _id: orderId }, { $set: { statusOrder: status } });
        return updatedOrder;
    }
    catch (error) {
        throw error;
    }
}

const assignDeliveryPerson = async function (orderId, deliveryPerson) {
    try {
        const order = await Order.findById(orderId);

        if (!order) {
            const error = new Error('Orden no encontrada');
            error.status = 404;
            throw error;
        }

        const deliveryPersonfound = await User.findById(deliveryPerson);

        if (!deliveryPersonfound) {
            const error = new Error('Repartidor no encontrado');
            error.status = 404;
            throw error;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { deliveryPerson: deliveryPerson },
            { new: true }
        );

        return updatedOrder;
    }
    catch (error) {
        throw error;
    }
}


module.exports = {
    cartToOrder,
    getAllOrders,
    getAllOrdersByCustomer,
    getAllOrdersByDeliveryPerson,
    getOrderByCustomer,
    getOrderByDeliveryPerson,
    getOrder,
    updateStatus,
    assignDeliveryPerson
}