const express = require('express')
const router = express.Router()
const BranchController = require('../../controllers/branch.controller')

router.post('/', BranchController.createBranch)
router.put('/branchId', BranchController.editBranch)
router.get('/', BranchController.consultBranches)

module.exports = router