const router = require('express').Router();
const auth = require('../../controllers/auth.controller');
const authorize = require('../../middlewares/auth.middleware');
const { validateAuth } = require('../../validators/auth.schema.validator');

router.post('/', validateAuth, auth.login);

module.exports = router;