const User = require('../models/User');

const postPaymentMethod = async (userId, newPaymentMethod) => {
    try {
        //TODO: Validar que el Id sea válido

        //TODO: Validar que No tenga 3 tarjetas YA registradas

        if (newPaymentMethod.cardNumber) {
            const existingCard = await User.findOne({ 'paymentMethods.cardNumber': newPaymentMethod.cardNumber });
            
            //TODO: Validar que la tarjeta no esté registrada a el usuario
            if (existingCard && existingCard._id.toString() == userId) {
                console.log('La tarjeta ya está registrada.');
                throw {
                    status: 400,
                    message: "La tarjeta ya está registrada."
                };
            }

            //TODO: Cifrar el CVV y numero de tarjeta
            // if (newPaymentMethod.cvv !== null && newPaymentMethod && newPaymentMethod.trim() !== ''){
            //     newPaymentMethod = await User.encryptCVV(newPaymentMethod.cvv);
            // }

            const userFound = await User.findById(userId);

            if (!userFound) {
                throw {
                    status: 404,
                    message: "Usuario no encontrado"
                };
            }

            userFound.paymentMethods = userFound.paymentMethods || [];

            userFound.client.paymentMethods.push(newPaymentMethod);

            await userFound.save();

            const addedPaymentMethod = userFound.client.paymentMethods[userFound.client.paymentMethods.length - 1];
            console.log("Método de pago agregado:", addedPaymentMethod);
            return addedPaymentMethod; 
        }
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }   
}

const getPaymentMethods = async (userId) => {
    try {
        //TODO: Validar que el Id sea válido

        const userFound = await User.findById(userId);

        if (!userFound) {
            throw {
                status: 404,
                message: "Usuario no encontrado"
            };
        }

        const paymentMethods = userFound.client.paymentMethods;

        return paymentMethods;
        
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }   
}

const deletePaymentMethod = async (userId, paymentMethodId) => {
    try {
        const userFound = await User.findById(userId);

        if (!userFound) {
            throw {
                status: 404,
                message: "Usuario no encontrado"
            };
        }

        if (!userFound.client || !userFound.client.paymentMethods) {
            throw {
                status: 400,
                message: "El usuario no tiene métodos de pago configurados"
            };
        }

        const paymentMethodFound = userFound.client.paymentMethods.id(paymentMethodId);

        if (!paymentMethodFound) {
            throw {
                status: 404,
                message: "Método de pago no encontrado"
            };
        }

        userFound.client.paymentMethods.pull(paymentMethodId);
        
        await userFound.save();

        return paymentMethodFound;
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }   
}

module.exports = { 
    postPaymentMethod,
    getPaymentMethods,
    deletePaymentMethod
}