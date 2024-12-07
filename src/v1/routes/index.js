const express = require('express');
const CategoryRoutes = require('./category.routes')
const UserRoutes = require('./user.routes');
const BranchRouter = require('./branch.routes')

const router = express.Router();

router.use('/categories', CategoryRoutes)
router.use("/users", UserRoutes);
router.use('/branches', BranchRouter)



router.use('*', (req, res) => { res.status(404).send()})

module.exports = router;
