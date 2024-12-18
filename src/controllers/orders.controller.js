const OrderService = require('../services/orders.service');

const getOrders = async (req, res, next) => { 
    try {
        const userId = req.params.userId;
        const status = req.query.status;

        const result = await OrderService.getOrders(userId, status);

        return res.status(200).send({
            message: "Ordenes recuperadas",
            orders: result
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
    getOrders
}
