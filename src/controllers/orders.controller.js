const OrderService = require('../services/orders.service.js');
const CartService = require('../services/carts.service.js');
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

let self = {}

self.cartToOrder = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const status = req.query.status;
        let defaultOrderStatus = 'pending';
        const { customer, branch, paymentMethod, orderProducts } = req.body;

        if (status !== 'reserved') {
            throw {
                status: 400,
                message: "El estado de la orden no pertenece a un carrito"
            };
        }

        if (!customer || !branch || !paymentMethod) {
            throw {
                status: 400,
                message: "Faltan datos"
            };
        }

        let finalPrice = 0;
        let cartPrice = await CartService.getMainCartDetails(customer, status);
        finalPrice = cartPrice.totalPrice;

        const orderDetails = {
            orderId: orderId,
            orderDate: new Date(),
            totalPrice: finalPrice,
            branch: branch,
            orderProducts: orderProducts,
            customer: customer,
            statusOrder: defaultOrderStatus,
            paymentMethod: paymentMethod
        }

        const result = await OrderService.cartToOrder(orderDetails);

        return res.status(200).send({
            message: "Carrito convertido en orden",
            order: result
        });

    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({ message: error.message });
        }
        next(error)
    }
}

self.getAll = async (req, res, next) => {
    try {

        const authHeader = req.header('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, jwtSecret);
        const role = decodedToken.role;

        let data = {};
        switch (role) {
            case 'Customer':
                data = await OrderService.getAllOrdersByCustomer(decodedToken.id);
                break;
            case 'Delivery Person':
                data = await OrderService.getAllOrdersByDeliveryPerson(decodedToken.id);
                break;
            default:
                data = await OrderService.getAllOrders();
                break;
        }

        return res.status(200).send({
            orders: data
        })
    } catch (error) {
        next(error);
    }
}

self.get = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const authHeader = req.header('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, jwtSecret);
        const role = decodedToken.role;
        let data = {};

        switch (role) {
            case 'Customer':
                data = await OrderService.getOrderByCustomer(decodedToken.id, orderId);
                break;
            case 'Delivery Person':
                data = await OrderService.getOrderByDeliveryPerson(decodedToken.id, orderId);
                break;
            default:
                data = await OrderService.getOrder(orderId);
                break;
        }

        return res.status(200).send({
            order: data
        });

    } catch (error) {
        next(error);
    }
}

self.updateStatus = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const status = req.params.status;
        const authHeader = req.header('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, jwtSecret);
        const role = decodedToken.role;
        const statusForDeliveryPerson = ['in transit', 'delivered', 'not delivered'];
        const statusForSalesExecutive = ['approved', 'denied'];
        const statusForCustomer = ['cancelled'];
        const order = await OrderService.getOrder(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (role === 'Delivery Person') {
            if (!statusForDeliveryPerson.includes(status)) {
                return res.status(403).json({ message: "Repartidor solo puede establecer el estado en 'en tránsito' o 'entregado' o 'no entregado'." });
            }
        } else if (role === 'Sales Executive') {
            if (!statusForSalesExecutive.includes(status)) {
                return res.status(403).json({ message: "El ejecutivo de ventas solo puede establecer el estado en 'aprobado' o 'denegado'." });
            }
        } else if (role === 'Customer') {
            if (!statusForCustomer.includes(status)) {
                return res.status(403).json({ message: "El cliente solo puede establecer el estado en 'cancelado'." });
            }
            if (order.status === 'in transit') {
                return res.status(400).json({ message: "La orden está en tránsito, no se puede cancelar." });
            }
        } else {
            return res.status(403).json({ message: "Rol no permitido para cambiar el estado de la orden." });
        }

        let result = await OrderService.updateStatus(orderId, status);
        return res.status(200).send({ message: "Estado de la orden actualizado", order: result });

    } catch (error) {
        next(error);
    }
};

self.assignDeliveryPerson = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const deliveryPersonId = req.params.deliveryPersonId;

        const result = await OrderService.assignDeliveryPerson(orderId, deliveryPersonId);

        return res.status(200).send({
            message: "Se ha asignado un repartidor a la orden",
            order: result
        });
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({ message: error.message });
        }
        next(error)
    }
}


module.exports = self;
