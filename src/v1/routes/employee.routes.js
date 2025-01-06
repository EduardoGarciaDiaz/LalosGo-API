const router = require('express').Router();
const employees = require('../../controllers/employees.controller');
const authorize = require('../../middlewares/auth.middleware');

router.get('/', authorize('Administrator'), employees.getAll);

router.get('/:id', authorize('Administrator'), employees.get);

router.post('/', authorize('Administrator'), employees.create);

router.put('/:id', authorize('Administrator'), employees.update);

router.patch('/:id', authorize('Administrator'), employees.updateStatus);

router.get('/:role/branch/:branchId', authorize('Administrator, Manager,Sales Executive'), employees.getEmployeeByRole);

module.exports = router;