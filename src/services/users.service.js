const { raw } = require('express');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');

const postPaymentMethod = async (userId, newPaymentMethod) => {
    try {
        //TODO: Validar que el Id sea válido

        //TODO: Validar que la fecha de expiración sea válida

        //TODO: Validar que No tenga 3 tarjetas YA registradas

        if (newPaymentMethod.cardNumber) {
            const existingCard = await User.findOne({ 'paymentMethods.cardNumber': newPaymentMethod.cardNumber });

            //TODO: Validar que la tarjeta no esté registrada a el usuario
            if (existingCard && existingCard._id.toString() == userId) {
                console.log('El método de pago ya está registrado.');
                throw {
                    status: 400,
                    message: "El método de pago ya está registrado."
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

const updatePaymentMethod = async (userId, paymentMethodId, updatedPaymentMethod) => {
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

        paymentMethodFound.set(updatedPaymentMethod);
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

const getUser = async function (id) {
    try{
        if(!mongoose.Types.ObjectId.isValid(id)){
            const error = new Error('Usuario con id inválido ' + id);
            error.status = 404;
            throw error;
        }
        
        let foundUser = await User.findById(id).select('-password');

        return foundUser;

    } catch(error){
        if(error.status){
            throw {
                status: error.status,
                message: error.message
            }

        }
        throw error;
    }
}

const getUserLogin = async (username) => {
    try {
        const userFound = await User.findOne({ username })

        if (!userFound) {
            return null;
        }

        if (userFound.client) {

            return {
                id: userFound._id.toString(),
                username: userFound.username,
                fullname: userFound.fullname,
                birthdate: userFound.birthdate,
                phone: userFound.phone,
                email: userFound.email,
                password: userFound.password,
                status: userFound.status,
                role: 'Customer'
            };
        } else if (userFound.employee) {
            return {
                id: userFound._id.toString(),
                fullname: userFound.fullname,
                role: userFound.employee.role,
                password: userFound.password,
                email: userFound.email
            };
        }
        throw {
            status: 400,
            message: "El usuario no tiene un rol asignado"
        };

    } catch (error) {
        throw error;
    }
};

const createClientAccount = async (newClientAccount) => {
    try {
        const newUser = new User(newClientAccount);
        await newUser.save();
        return newUser;

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

const findUserByEmailOrPhoneNumber = async (email, phone, username) => {
    try {
        const user = await User.findOne({
            $or: [{ email }, { phone }, { username }]
        });
        
        return user;
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            };
        }
        throw error;
    }
};


const updateClientAccount = async (id, client) => {
    try{
       const repeatedUser = await User.findOne({
            $or:[
                {username: client.username},
                {email: client.email},
                {phone: client.phone}
            ], 
            _id: {$ne: id}
        });

        if(repeatedUser){
            const error = new Error('La información es incorrecta');
            error.status = 400;
            throw error;
        }     

        const updateClientData = await User.findOneAndUpdate(
            {_id: id},
            {$set: client},
            {new: true}
        );

        if(!updateClientData){
            console.log("No se pudo actualizar el usuario");
            const error = new Error('No se pudo actualizar el usuario');
            error.status = 500;
            throw error;
        }

        const updatedClient = await User.findById(id).select('-password');
        return updatedClient;
    } catch(error){
        if(error.status){
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

const recoverPassword = async (userId, newPassword) => {
    try {
        const userFound = await User.findOne(userId);

        if (!userFound) {
            throw {
                status: 404,
                message: "RecoverPassword: Usuario no encontrado"
            };
        }

        userFound.password.set(newPassword);
        userFound.save();
        return userFound;
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
    deletePaymentMethod,
    updatePaymentMethod,
    createClientAccount,
    updateClientAccount,
    recoverPassword,
    getUserLogin,
    getUser,
    findUserByEmailOrPhoneNumber
}