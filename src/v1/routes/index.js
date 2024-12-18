const express = require('express');
const CategoryRoutes = require('./category.routes')
const UserRoutes = require('./user.routes');
const BranchRoutes = require('./branch.routes')
const EmployeeRoutes = require('./employee.routes')
const AuthRoutes = require('./auth.routes')

const router = express.Router();

router.use('/categories', CategoryRoutes)
router.use("/users", UserRoutes);
router.use('/branches', BranchRoutes)
router.use('/employees', EmployeeRoutes)
router.use('/auth', AuthRoutes)



router.use('*', (req, res) => { res.status(404).send()})

module.exports = router;
