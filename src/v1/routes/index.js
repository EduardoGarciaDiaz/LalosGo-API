const express = require('express');
const router = express.Router();

const UserRoutes = require('./user.routes');

router.use("/users", UserRoutes);
router.use('*', (req, res) => { res.status(404).send()})

module.exports = router;