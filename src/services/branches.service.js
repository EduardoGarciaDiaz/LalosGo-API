const mongoose = require('mongoose')
const BranchSchema = require('../models/Branch')

const ACTIVE_BRANCH = true
const INACTIVE_BANCH = false

const saveBranch = async(branch) => {
    try {
        let reapeatedBranch = await BranchSchema.findOne({$or: [{name: branch.name}, {_id: branch._id}]})
        if(reapeatedBranch){
            throw{
                status: 400,
                message: "La sucursal ya se encuentra registrada."
            }
        }

        let newBranch = new BranchSchema(branch)
        let savedBranch = newBranch.save()
        let foundBranch = await BranchSchema.findById(savedBranch._id)
        return foundBranch;
    } catch (error) {
        if(error.status){
            throw{
                status: error.status,
                message: error.message
            }
        }
        throw error
    }
}

const updateBranch = async(branchToUpdate, isStatusChange) => {
    try {
        let foundBranch = await BranchSchema.findById(branchToUpdate._id)
        if(!foundBranch){
            throw {
                status: 404,
                message: "La sucursal que quieres editar no existe."
            }
        }

        let updatedBranch = await BranchSchema.findOneAndUpdate({_id:branchToUpdate._id}, {$set: branchToUpdate}, {new: true})
        foundBranch = await BranchSchema.findById(updatedBranch._id)
        if(isStatusChange){
            await updateBranchStatuss(foundBranch)
        }
        return foundBranch
    } catch (error) {
        if(error.status){
            throw{
                status : error.status,
                message: error.message
            }
        }
        throw error
    }
} 

const updateBranchProductsQuantity = async(branchToUpdate, productsToAdd) => {
    try {
        let foundBranch = await BranchSchema.findById(branchToUpdate._id)
        if(!foundBranch){
            throw {
                status: 404,
                message: "La sucursal que quieres editar no existe."
            }
        }

        let updatedBranch = await BranchSchema.findByIdAndUpdate(
            branchToUpdate._id,
            {
                $addToSet: {branchProducts:{ $each: productsToAdd}}
            },
            {new: true, useFindAndModify: false}
        )
        return updatedBranch
    } catch (error) {
        if(error.status){
            throw{
                status: error.status,
                message: error.message
            }
        }
    }
}





async function updateBranchStatuss(branchToChangeStatus) {
    //Desactivar empleador de la empresa.
}

const consultBranches = async(isRecoveringProducts) => {
    try {
        let foundBranches;

        if (isRecoveringProducts) {
            foundBranches  = await BranchSchema.find();
        } else {
            foundBranches = await BranchSchema.find({}, {branchProducts: 0});
        }

        if (!foundBranches || foundBranches.length === 0) {
            throw {
                status: 404,
                message: "No se encontraron sucursales registradas"
            }
        }

        return foundBranches;

    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error
    }
}

const toggleBranchStatus = async(branchId, newStatus) => {
    try {
        const branchFound = await BranchSchema.findById(branchId);

        if (!branchFound) {
            throw {
                status: 404,
                message: "La sucursal que quieres actualizar no existe."
            }
        }

        let newBranchStatus = branchFound.branchStatus === ACTIVE_BRANCH ? INACTIVE_BANCH : ACTIVE_BRANCH;

        branchFound.branchStatus = newBranchStatus;
        await branchFound.save();

        return branchFound;
    }
    catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error
    }
}




module.exports = {
    saveBranch,
    updateBranch,
    updateBranchProductsQuantity,
    consultBranches,
    toggleBranchStatus
}


