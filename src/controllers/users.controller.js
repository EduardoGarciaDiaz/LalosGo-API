const UserService = require('../services/users.service');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const postPaymentMethod = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        const userId = req.params.userId;

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
                .send({ message: error.message });
        }
        next(error)
    }
}

const getPaymentMethods = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        const userId = req.params.userId;

        const result = await UserService.getPaymentMethods(userId);

        return res.status(200).send({
            message: "Métodos de pago recuperados",
            userPaymentMethods: result
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

const deletePaymentMethod = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }
        
        const userId = req.params.userId;

        const paymentMethodId = req.params.paymentMethodId;

        const result = await UserService.deletePaymentMethod(userId, paymentMethodId);

        return res.status(200).send({
            message: "Método de pago eliminado correctamente",
            data: result
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

const updatePaymentMethod = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({ message: `El id del usuario '${userId}' viene nulo o vacío` })
        }

        const paymentMethodId = req.params.paymentMethodId;
        if (!paymentMethodId || paymentMethodId === null || paymentMethodId === '') {
            return res.status(400).send({ message: `El id del método de pago '${paymentMethodId}' viene nulo o vacío` })
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
                .send({ message: error.message });
        }
        next(error)
    }
}

const createClientAccount = async (req, res, next) => {
    try {
        const { username, fullname, birthdate, phone, email, password, client } = req.body;

        const existinguser = await UserService.findUserByEmailOrPhoneNumber(email, phone, username);

        if (existinguser) {
            return res.status(400).send({ message: "Error al registrar los datos del usuario, correo, numero o usuario repetido" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newClientAccount = {
            username,
            fullname,
            birthdate,
            phone,
            email,
            password: hashedPassword,
            status: 'Active',
            client,
        }

        const result = await UserService.createClientAccount(newClientAccount);

        return res.status(201).send({

            message: "Cuenta de cliente creada correctamente",
            newClientAccount: result
        });
    } catch (error) {

        console.log(error)
        if (error.status) {
            return res
                .status(error.status)
                .send({ message: error.message });
        }
        next(error)
    }
}

const updateClientAccount = async (req, res, next) => {
    try {
        const userId = req.params.id;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({ error: `El id del usuario '${userId}' está vacío o nulo` });
        }

        const { username, fullname, birthdate, phone } = req.body;

        const updateClientAccount = {
            username,
            fullname,
            birthdate,
            phone
        }

        console.log(updateClientAccount.username);

        const result = await UserService.updateClientAccount(userId, updateClientAccount);
        return res.status(200).send({
            message: "Cuenta de cliente actualizada correctamente",
            updateClientAccount: result
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

const recoverPassword = async (req, res, next) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const userId = req.params.userId;

        if (!userId || userId === null || userId === '') {
            return res.status(400).send({ error: `El id del usuario '${userId}' viene nulo o vacío` })
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

    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({ message: error.message });
        }
        next(error)
    }

}




const postAddress = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: `El id del usuario '${userId}' viene nulo o vacío`})
        }

        const { street, number, cologne, zipcode, locality, 
            federalEntity, internalNumber, type, latitude, 
            longitude, isCurrentAddress } = req.body;

        const newAddress = {
            street,
            number,
            cologne,
            zipcode,
            locality,
            federalEntity,
            internalNumber,
            type,
            latitude,
            longitude,
            isCurrentAddress
        }

        const result = await UserService.postAddress(userId, newAddress);

        return res.status(201).send({
            message: "Dirección registrada correctamente",
            newAddress: result
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

const putAddress = async (req, res, next) => {
    try {

        const userId = req.params.userId;
        const addressId = req.params.addressId;

        if (!userId || userId === null || userId === '') {
            return res.status(400).send({error: `El id del usuario '${userId}' viene nulo o vacío`})
        }

        const { street, number, cologne, zipcode, locality, 
            federalEntity, internalNumber, latitude, 
            longitude} = req.body;

        const newAddress = {
            street,
            number,
            cologne,
            zipcode,
            locality,
            federalEntity,
            internalNumber,
            latitude,
            longitude,
        }

        const result = await UserService.putAddress(userId, addressId, newAddress);

        return res.status(201).send({
            message: "Dirección actualizada correctamente",
            newAddress: result
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
    deletePaymentMethod,
    updatePaymentMethod,
    createClientAccount,
    updateClientAccount,
    recoverPassword,
    postAddress, 
    putAddress
}