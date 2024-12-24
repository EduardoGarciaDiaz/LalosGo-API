const { raw } = require('express');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');
const { updateClientAccount } = require('./users.service');


const getAddresses = async (userId) => {
    try {
        //TODO: Validar que el Id sea válido

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

module.exports = {
    getAddresses,
    changeCurrentAddress 
}