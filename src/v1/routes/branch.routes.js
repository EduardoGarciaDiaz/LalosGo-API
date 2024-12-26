const express = require('express')
const router = express.Router()
const BranchController = require('../../controllers/branch.controller')
const {
    validateCreateBranch,
    validateEditBranch,
    validateConsultBranch,
    validateToggleBranchStatus
} = require('../../validators/branch.schema.validator')


router.post('/', validateCreateBranch , BranchController.createBranch)
router.put('/:branchId', validateEditBranch , BranchController.editBranch)
router.get('/', BranchController.consultBranches)
router.get('/:branchId', validateConsultBranch ,BranchController.consultBranch)
router.patch('/:branchId', validateConsultBranch ,BranchController.toggleBranchStatus)

module.exports = router