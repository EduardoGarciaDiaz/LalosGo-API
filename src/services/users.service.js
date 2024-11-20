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

            //TODO: Cifrar el CVV
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

            return newPaymentMethod;
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

module.exports = { postPaymentMethod }