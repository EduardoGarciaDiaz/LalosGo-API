const UserService = require('../services/users.service');
const User = require('../models/User');

const postPaymentMethod = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: "El id del usuario 'userId' viene nulo o vacío"})
        }

        const { cardOwner, cardNumber, cardEmitter, expirationDate, cvv, cardType } = req.body;

        //TODO: Validar campos no nulos o vacios

        const newPaymentMethod = {
            cardOwner,
            cardNumber,
            cardEmitter,
            expirationDate,
            cvv,
            cardType
        }

        const result = await UserService.postPaymentMethod(userId, newPaymentMethod);

        return res.status(201).send({
            message: "Tarjeta registrada correctamente",
            data: result
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
    postPaymentMethod
}