const addressesService = require('../services/addresses.service');
const BranchService = require('../services/branches.service')
const CartService = require('../services/carts.service')
const { validationResult } = require('express-validator');

const getAddresses = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId === null || userId === '') {
            return res.status(400).send({ error: `El id del usuario '${userId}' viene nulo o vacío` })
        }

        const result = await addressesService.getAddresses(userId);

        return res.status(200).send({
            message: "Direcciones recuperadas",
            addresses: result
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

const updateCurrentAddresStatus = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const address = req.body

        if (!userId || userId === null || userId === '') {
            return res.status(400).send({ error: `El id del usuario '${userId}' viene nulo o vacío` })
        }

        const result = await addressesService.changeCurrentAddress(userId, address);
        let resultOfOperation
        if(result){
            let location ={
                latitude: result.latitude,
                longitude: result.longitude,
                type: result.type
            } 
            let branchId = await BranchService.getNearestBranch(location)
            resultOfOperation = await CartService.validateCartProductsWithNewAddress(userId, branchId)
        }else{
            throw{
                status: 400,
                message: "Ocurrio un error al actualizar el estatus de la dirección de envio actual"
            }
        }

        return res.status(200).send({
            message: "Direccion actual actualizada, los productos del carrito se han actualizado",
            addresses: resultOfOperation
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        const userId = req.params.userId;
        
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

        const result = await addressesService.postAddress(userId, newAddress);

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }


        const userId = req.params.userId;
        const addressId = req.params.addressId;

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

        const result = await addressesService.putAddress(userId, addressId, newAddress);

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

const deleteAddress = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        const userId = req.params.userId;
        const addressId = req.params.addressId;

        const currentAddress = await addressesService.deleteAddress(userId, addressId);

        return res.status(200).send({
            message: "Dirección eliminada correctamente",
            currentAddressId: currentAddress
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
    getAddresses,
    updateCurrentAddresStatus, 
    postAddress, 
    putAddress, 
    deleteAddress
}