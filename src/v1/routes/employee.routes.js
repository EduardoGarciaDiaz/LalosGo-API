const router = require('express').Router();
const employees = require('../../controllers/employees.controller');
const authorize = require('../../middlewares/auth.middleware');

router.get('/', authorize('Manager'), employees.getAll);

router.get('/:id', employees.get);

router.post('/', employees.create);

router.put('/:id', employees.update);

module.exports = router;