const Order = require('../models/Order');
const Branch = require('../models/Branch');
const mongoose = require('mongoose');

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
            orderNumber: orderDetails.orderNumber,
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
        const orders = await Order.find({});
        return orders;
    } catch (error) {
        throw error;
    }
}

const getAllOrdersByCustomer = async function (customerId) {
    try {
        const orders = await Order.find({ _id: customerId });
        return orders;
    }
    catch (error) {
        throw error;
    }
}

const getAllOrdersByDeliveryPerson = async function (deliveryPersonId) {
    try {
        const orders = await Order.find({ _id: deliveryPersonId });
        return orders;
    }
    catch (error) {
        throw error;
    }
}

    module.exports = {
        cartToOrder,
        getAllOrders,
        getAllOrdersByCustomer,
        getAllOrdersByDeliveryPerson
    }