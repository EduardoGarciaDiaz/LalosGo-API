const UserService = require('../services/users.service');
const User = require('../models/User');

const postPaymentMethod = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: `El id del usuario '${userId}' viene nulo o vacío`})
        }

        const { cardOwner, cardNumber, cardEmitter, expirationDate, cvv, cardType, paymentNetwork } = req.body;

        //TODO: Validar campos no nulos o vacios

        const newPaymentMethod = {
            cardOwner,
            cardNumber,
            cardEmitter,
            expirationDate,
            cvv,
            cardType,
            paymentNetwork
        }

        const result = await UserService.postPaymentMethod(userId, newPaymentMethod);

        return res.status(201).send({
            message: "Tarjeta registrada correctamente",
            newPaymentMethod: result
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

const getPaymentMethods = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: `El id del usuario '${userId}' viene nulo o vacío`})
        }

        const result = await UserService.getPaymentMethods(userId);

        return res.status(200).send({
            message: "Métodos de pago recuperados",
            userPaymentMethods: result
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

const deletePaymentMethod = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: `El id del usuario '${userId}' viene nulo o vacío`})
        }

        const paymentMethodId = req.params.paymentMethodId;
        if (!paymentMethodId || paymentMethodId === null || paymentMethodId === '') {
            return res.status(400).send({error: `El id del método de pago '${paymentMethodId}' viene nulo o vacío`})
        }

        const result = await UserService.deletePaymentMethod(userId, paymentMethodId);

        return res.status(200).send({
            message: "Métodod de pago eliminado correctamente",
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
    postPaymentMethod,
    getPaymentMethods,
    deletePaymentMethod
}