const UserService = require('../services/users.service');
const User = require('../models/User');

const postPaymentMethod = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: `El id del usuario '${userId}' viene nulo o vacío`})
        }

        const { cardOwner, cardNumber, cardEmitter, expirationDate, cardType, paymentNetwork } = req.body;

        //TODO: Validar campos no nulos o vacios

        const newPaymentMethod = {
            cardOwner,
            cardNumber,
            cardEmitter,
            expirationDate,
            cardType,
            paymentNetwork
        }

        const result = await UserService.postPaymentMethod(userId, newPaymentMethod);

        return res.status(201).send({
            message: "Método de pago registrado correctamente",
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
            message: "Método de pago eliminado correctamente",
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

const updatePaymentMethod = async (req, res, next) => { 
    try {
        const userId = req.params.userId;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: `El id del usuario '${userId}' viene nulo o vacío`})
        }

        const paymentMethodId = req.params.paymentMethodId;
        if (!paymentMethodId || paymentMethodId === null || paymentMethodId === '') {
            return res.status(400).send({error: `El id del método de pago '${paymentMethodId}' viene nulo o vacío`})
        }

        const { cardOwner, cardNumber, cardEmitter, expirationDate, cvv, cardType, paymentNetwork } = req.body;

        const updatedPaymentMethod = {
            cardOwner,
            cardNumber,
            cardEmitter,
            expirationDate,
            cvv,
            cardType,
            paymentNetwork
        }

        const result = await UserService.updatePaymentMethod(userId, paymentMethodId, updatedPaymentMethod);

        return res.status(200).send({
            message: "Método de pago actualizado",
            updatedPaymentMethod: result
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

const createClientAccount = async (req, res, next) => {
    try{
        const { username,fullname, birthdate, phone, email, password, client} = req.body;

        const existinguser = await userService.findUserByEmailOrPhoneNumber(email, phone, username);
        
        if (existinguser) {
            return res.status(400).send({message: "Error al registrar los datos del usuario"});
        }

        const newClientAccount = {
            username,
            fullname,
            birthdate,
            phone,
            email,
            password,
            status: 'Active', 
            client,
        }

        const result = await UserService.createClientAccount(newClientAccount);

        return res.status(201).send({
            message: "Cuenta de cliente creada correctamente",
            newClientAccount: result
        });
    }catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const findUserByEmailOrPhoneNumber = async (email, phone) => {
    const user = UserModel.findOne({
        $or: [{email}, {phone}, {username}]
    });
    return user;
}

const updateClientAccount = async (req, res, next) => {
    try{
        const { fullname, birthdate, phone, email, password} = req.body;
        const userId = req.params.userId;

        const newClientAccount = {
            fullname,
            birthdate,
            phone,
            email,
            password,
            status: 'Active', 
        }
        const result = await UserService.updateClientAccount(userId, newClientAccount);
        return res.status(200).send({
            message: "Cuenta de cliente creada correctamente",
            newClientAccount: result
        });
    }catch (error) {
        console.log("Entró al catch " + error);
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const recoverPassword = async (req, res, next) => {
    try{
        const { newPassword, confirmPassword} = req.body;
        const userId = req.params.userId;

        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: `El id del usuario '${userId}' viene nulo o vacío`})
        }

        if (!newPassword?.trim() || !confirmPassword?.trim()) {
            return res.status(400).send({
                message: "Los campos 'newPassword' y 'confirmPassword' no pueden estar vacíos"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).send({
                message: "Las contraseñas no coinciden"
            });
        }

        const result = await UserService.recoverPassword(userId, newPassword);

        return res.status(200).send({
            message: "La contraseña ha sido actualizada correctamente",
            result: result
        });

    }catch (error) {
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
    deletePaymentMethod,
    updatePaymentMethod, 
    createClientAccount, 
    updateClientAccount, 
    recoverPassword
}