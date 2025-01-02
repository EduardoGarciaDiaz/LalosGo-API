const BranchService = require('../services/branches.service')
const { validationResult } = require('express-validator');

const ACTIVE_BRANCH = true
const INACTIVE_BANCH = false

const createBranch = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }
        
        const {name, openingTime, closingTime, address} = req.body
        const newBranch = {
            name, 
            openingTime,
            closingTime,
            address, 
            branchStatus: ACTIVE_BRANCH
        }
        resultOperation = await BranchService.saveBranch(newBranch)
        return res.status(201).send({
            message:"Sucursal creada con éxito.",
            branch: resultOperation  
        })
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const editBranch = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        let {branchId} = req.params
        let {_id, name, openingTime, closingTime, address, branchStatus} = req.body
        let { changeStatus } = req.query
        let {branchProducts} = req.body
        let branchToUpdate = {
            _id: branchId, 
            name,
            openingTime,
            closingTime,
            address
        }
        let resultOperation
        let message
        if (changeStatus !== undefined && changeStatus) {
            branchToUpdate.status = changeStatus
            resultOperation = await BranchService.updateBranch(branchToUpdate, true)
            if(changeStatus==="Active"){
                message = "La sucursal se ha activado correctamente."
            }else{
                message = "La sucursal se ha desactivado correctamente."
            }
        } else if (branchProducts){
            resultOperation = await BranchService.updateBranchProductsQuantity(branchToUpdate, branchProducts)
            message = "Se han guardado los productos de la sucursal correctamente"
        } else {
            resultOperation = await BranchService.updateBranch(branchToUpdate, false)
            message = "Se ha actualizado la información de la sucursal correctamente"
        }

        return res.status(200).send({
            message: message,
            branch: resultOperation
        })

    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const consultBranches = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        let {recoverProduct} = req.query
        let {location} = req.query
        let {productId} = req.query
        if (recoverProduct !== undefined && recoverProduct){
            resultOperation = await BranchService.consultBranches(true)
        } else if (location) {
            resultOperation  = await BranchService.getNearestBranch(location)
        } else if(productId){
            resultOperation = await BranchService.getBranchesWithSpecificProduct(productId)
        } else{
            resultOperation = await BranchService.consultBranches(false)
    
        }
        return res.status(200).send({
            message: "",
            branches: resultOperation
        })
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const consultBranch = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }

        let { branchId } = req.params;

        let branch = await BranchService.consultBranch(branchId);
        return res.status(200).send({
            message: "Sucursal recupera con éxito",
            branch: branch
        })
    } catch (error) {
        if (error.status) {
            return res
                .status(error.status)
                .send({message: error.message});
        }
        next(error)
    }
}

const toggleBranchStatus = async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Los datos proporcionados no son válidos",
                errors: errors.array()
            });
        }
        
        let { branchId } = req.params
        let resultOperation = await BranchService.toggleBranchStatus(branchId);
        return res.status(200).send({
            message: "Estado de sucursal actualizado.",
            branch: resultOperation
        })
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
    createBranch, 
    editBranch,
    consultBranches,
    consultBranch,
    toggleBranchStatus
}