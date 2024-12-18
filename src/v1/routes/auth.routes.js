const router = require('express').Router();
const auth = require('../../controllers/auth.controller');
const authorize = require('../../middlewares/auth.middleware');

router.post('/', auth.login);

module.exports = router;