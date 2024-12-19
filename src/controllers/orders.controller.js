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
        let cartPrice = await CartService.getCartPrice(customer, status);
        finalPrice = cartPrice.totalPrice;

        const orderDetails = {
            orderId: orderId,
            orderNumber: Math.floor(Math.random() * 1000000),
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
        const decodedToken = jwt.verify(token, jwtSecret);
        const { role } = decodedToken;

        const data = {};
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
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

module.exports = self;
