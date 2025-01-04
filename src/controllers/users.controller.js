const UserService = require('../services/users.service');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { Resend } = require('resend');
require('dotenv').config();

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

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
    }catch (error) {
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }


        const { newPassword, confirmPassword } = req.body;
        const userId = req.params.userId;

        if (newPassword !== confirmPassword) {
            return res.status(400).send({
                message: "Las contraseñas no coinciden"
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        const result = await UserService.recoverPassword(userId, hashedPassword);

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

const sendEmail = async (req, res, next) => {
    try {
        const {confirmationCode, email} = req.body;

        const user = await UserService.findUserByEmail(email);

        if (!user) {
            return res.status(404).send({message: "El email no existe"});
        } else {
            console.log(user);
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        (async function () {
            await resend.emails.send({
              from: 'Acme <onboarding@resend.dev>',
              to: [email],
              subject: 'Prueba envío código',
              html: `<p>El código de confirmación es: ${confirmationCode}</p>`,
            });
          })();

        const id = user._id;
        return res.status(200).send({
            message: "Se ha enviado el correo correctamente",
            userId: id
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
    recoverPassword,
    sendEmail
}