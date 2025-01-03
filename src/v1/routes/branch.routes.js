const express = require('express')
const router = express.Router()
const BranchController = require('../../controllers/branch.controller')
const authorize = require('../../middlewares/auth.middleware');
const {
    validateCreateBranch,
    validateEditBranch,
    validateConsultBranch,
    validateToggleBranchStatus
} = require('../../validators/branch.schema.validator')


router.post('/', authorize('Administrator'), validateCreateBranch, BranchController.createBranch)
router.put('/:branchId', authorize('Administrator'), validateEditBranch, BranchController.editBranch)
router.get('/', authorize('Administrator,Customer'),  BranchController.consultBranches)
router.get('/:branchId', authorize('Administrator,Customer'), validateConsultBranch, BranchController.consultBranch)
router.patch('/:branchId', authorize('Administrator'), validateToggleBranchStatus, BranchController.toggleBranchStatus)


module.exports = router