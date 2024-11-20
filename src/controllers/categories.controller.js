const CategoriesService = require('../services/categories.service')

const createCategory = async(req, res, next) => {
    try {
        const {identifier, name, categoryStatus} = req.body
        resultOperation = await CategoriesService.saveCategory(identifier, name)
        res.status(201).send({
            message: "Categoría creada exitosamente.",
            category: resultOperation
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

const editCategory = async(req, res, next) => {
    try {
        const _id = req.params.categoryId
        const {changeStatus} = req.query;
        const {identifier, name, status} =  req.body
        const categoryToUpdate = {
            _id, 
            identifier,
            name,
            status
        }
        let resultOperation
        let message
        if(changeStatus){
            categoryToUpdate.status = changeStatus
            resultOperation = await CategoriesService.updateCategoryStatus(categoryToUpdate)
            if(changeStatus==="Active"){
                message = "La categoría se ha activado correctamente."
            }else{
                message = "La categoría se ha desactivado correctamente."
            }
        }else{
            resultOperation = await CategoriesService.updateCategoryStatus(categoryToUpdate)
            message = "La categoría se ha actualizado exitosamente"
        }

        res.status(200)({
            message: message,
            category: resultOperation
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

module.exports  = {
    createCategory,
    editCategory
}