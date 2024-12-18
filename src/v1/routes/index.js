const express = require('express');
const CategoryRoutes = require('./category.routes')
const UserRoutes = require('./user.routes');
const ProductRoutes = require('./product.routes')
const BranchRoutes = require('./branch.routes')

const router = express.Router();

router.use('/categories', CategoryRoutes)
router.use("/users", UserRoutes);
router.use('/branches', BranchRoutes)
router.use('/products', ProductRoutes)



router.use('*', (req, res) => { res.status(404).send()})

module.exports = router;
