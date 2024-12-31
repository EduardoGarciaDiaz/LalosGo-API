const mongoose = require('mongoose')
const BranchSchema = require('../models/Branch')

const ACTIVE_BRANCH = true
const INACTIVE_BANCH = false

const saveBranch = async (branch) => {
    try {
        let reapeatedBranch = await BranchSchema.findOne({ $or: [{ name: branch.name }, { _id: branch._id }] })
        if (reapeatedBranch) {
            throw {
                status: 400,
                message: "Ya existe una sucursal con ese nombre."
            }
        }

        let newBranch = new BranchSchema(branch)
        let savedBranch = await newBranch.save();
        let foundBranch = await BranchSchema.findById(savedBranch._id)
        return foundBranch;
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

const updateBranch = async (branchToUpdate, isStatusChange) => {
    try {
        let foundBranch = await BranchSchema.findById(branchToUpdate._id)
        if (!foundBranch) {
            throw {
                status: 404,
                message: "La sucursal que quieres editar no existe."
            }
        }

        let existingBranch = await BranchSchema.findOne({ name: branchToUpdate.name, _id: { $ne: branchToUpdate._id } });
        if (existingBranch) {
            throw {
                status: 400,
                message: "Ya existe una sucursal con ese nombre."
            }
        }

        let updatedBranch = await BranchSchema.findOneAndUpdate({ _id: branchToUpdate._id }, { $set: branchToUpdate }, { new: true })
        foundBranch = await BranchSchema.findById(updatedBranch._id)
        if (isStatusChange) {
            await updateBranchStatuss(foundBranch)
        }
        return foundBranch
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

const updateBranchProductsQuantity = async (branchToUpdate, productsToAdd) => {
    try {
        let foundBranch = await BranchSchema.findById(branchToUpdate._id)
        if (!foundBranch) {
            throw {
                status: 404,
                message: "La sucursal que quieres editar no existe."
            }
        }

        let updatedBranch = await BranchSchema.findByIdAndUpdate(
            branchToUpdate._id,
            {
                $addToSet: { branchProducts: { $each: productsToAdd } }
            },
            { new: true, useFindAndModify: false }
        )
        return updatedBranch
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
    }
}

async function updateBranchStatuss(branchToChangeStatus) {
    //Desactivar empleador de la empresa.
}

const consultBranches = async (isRecoveringProducts) => {
    try {
        let foundBranches;

        if (isRecoveringProducts) {
            foundBranches = await BranchSchema.find();
        } else {
            foundBranches = await BranchSchema.find({}, { branchProducts: 0 });
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

const consultBranch = async (branchId) => {
    try {
        let branchFound;

        if (branchId!==undefined && branchId) {
            branchFound = await BranchSchema.findById(branchId);
        } else {
            throw {
                status: 400,
                message: "El id de la sucursal es requerido."
            }
        }

        if (!branchFound) {
            throw {
                status: 404,
                message: "No se encontró la sucursal con el id " + branchId
            }
        }

        return branchFound;

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

const getBranchesWithSpecificProduct = async (productId) => {
    try {
        let branches = await BranchSchema.aggregate([
            {
                $addFields: {
                    filteredProducts: {
                        $filter: {
                            input: "$branchProducts",
                            as: "product",
                            cond: { $eq: ["$$product.product", new mongoose.Types.ObjectId(productId)] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    branchProducts: "$filteredProducts" 
                }
            },
            {
                $project: {
                    filteredProducts: 0 
                }
            }
        ]);
        return branches;
    } catch (error) {
        console.error("Error fetching branches:", error);
        throw error;
    }
};




const toggleBranchStatus = async (branchId, newStatus) => {
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

const getNearestBranch = async (userLocation) => {
    try {
        let branches = await consultBranches(false)
        if(!branches){
            throw {
                status: 400,
                message: "No hay sucursales disponibles."
            }
        }
        let nearestBranch = null;
        let minDistance = Infinity;

        branches.forEach((branch) => {
            if (branch.address.location && branch.address.location.coordinates) {
                const distance = calculateDistance(userLocation.latitude, userLocation.longitude, branch.address.location.coordinates[0], branch.address.location.coordinates[1]);
                if (distance < 5 && distance < minDistance) {
                    minDistance = distance;
                    nearestBranch = branch;
                }
            }
        });
        
        if(!nearestBranch){
            throw {
                status: 400,
                message: "Lo sentimos, no hay una sucursal cerca de su dirección, intente cmabiando de dirección."
            }
        }
        return nearestBranch._id;
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

const calculateDistance = (lat1, lon1, lat2, lon2) => { 

    const EARTH_RADIUS_KM = 6371;
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
};

module.exports = {
    saveBranch,
    updateBranch,
    updateBranchProductsQuantity,
    consultBranches,
    consultBranch,
    toggleBranchStatus,
    getNearestBranch,
    getBranchesWithSpecificProduct
}


