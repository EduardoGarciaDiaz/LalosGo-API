const router = require('express').Router();
const employees = require('../../controllers/employees.controller');
const authorize = require('../../middlewares/auth.middleware');

router.get('/', authorize('Manager'), employees.getAll);

router.get('/:id', authorize('Manager'), employees.get);

router.post('/', authorize('Manager'), employees.create);

router.put('/:id', authorize('Manager'), employees.update);

module.exports = router;