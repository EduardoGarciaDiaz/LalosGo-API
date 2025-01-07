const { raw } = require('express');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');
const { updateClientAccount } = require('./users.service');
const { addAbortListener } = require('supertest/lib/test');


const getAddresses = async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw {
                status: 400,
                message: "El id del usuario es inválido"
            };
        }

        const userFound = await User.findById(userId);

        if (!userFound) {
            throw {
                status: 404,
                message: "Usuario no encontrado"
            };
        }

        const addresses = userFound.client.addresses;

        return addresses;

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

const changeCurrentAddress = async (userId, {address}) =>{
    try {
        
        const userFound = await User.findById(userId);

        if (!userFound) {
            throw {
                status: 404,
                message: "Usuario no encontrado"
            };
        }

        const user = userFound;
        let newCurrentAddress
        if(address.isCurrentAddress){
            
        
            newCurrentAddress =  address
        }else{
            user.client.addresses.forEach(element => {               
                if(element._id == address._id){
                    element.isCurrentAddress = true
                    newCurrentAddress = element
                }else{
                    element.isCurrentAddress = false
                }
            });
          await user.save()
        }

        return newCurrentAddress;
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

const postAddress = async (userId, newAddress) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw {
                status: 400,
                message: "El id del usuario es inválido"
            };
        }

        const userFound = await User.findById(userId);

        if (!userFound) {
            throw {
                status: 404,
                message: "Usuario no encontrado"
            };
        }
        userFound.client.addresses.push(newAddress);

        await userFound.save();
        const addedAdress = userFound.client.addresses[userFound.client.addresses.length - 1];
        return addedAdress;

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

const putAddress = async (userId, addressId, updatedPaymentMethod) => {
    try {
        const userFound = await User.findById(userId);

        if (!userFound) {
            throw {
                status: 404,
                message: "Usuario no encontrado"
            };
        }

        if (!userFound.client.addresses) {
            throw {
                status: 400,
                message: "El usuario no tiene direcciones asignadas"
            };
        }

        const addressFound = userFound.client.addresses.id(addressId);
        if (!addressFound) {
            throw {
                status: 404,
                message: "Dirección no encontrado"
            };
        }

        addressFound.set(updatedPaymentMethod);
        await userFound.save();

        return addressFound;
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

const deleteAddress = async (userId, addressId) => {    
    try {
        const userFound = await User.findById(userId);
        if (!userFound) {
            throw { status: 404, message: "Usuario no encontrado"};
        }

        const addresses = userFound.client.addresses;

        if (!addresses || addresses.length === 0) {
            throw { status: 400, message: "El usuario no tiene direcciones registradas" };
        }

        if (addresses.length === 1) {
            throw { status: 400, message: "Debe haber al menos una dirección registrada. No se puede eliminar la única dirección registrada" };
        }

        const addressIndex = addresses.findIndex(address => address._id.toString() === addressId);

        if (addressIndex === -1) {
            throw { status: 404, message: "Dirección no encontrada" };
        }

        const isCurrentAddress = addresses[addressIndex].isCurrentAddress;

        addresses.splice(addressIndex, 1);

        if (isCurrentAddress && addresses.length > 0) {
            addresses[0].isCurrentAddress = true;
            let userUpdated = await userFound.save();
            return  userUpdated.client.addresses[0]
        }
        
        await userFound.save();
       

    } catch (error) {
        if (error.status) {
            throw { status: error.status, message: error.message};
        }
        throw error;
    }
}

module.exports = {
    getAddresses,
    changeCurrentAddress, 
    postAddress, 
    putAddress, 
    deleteAddress
}