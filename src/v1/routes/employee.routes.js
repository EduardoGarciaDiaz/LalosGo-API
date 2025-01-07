const router = require('express').Router();
const employees = require('../../controllers/employees.controller');
const authorize = require('../../middlewares/auth.middleware');
const { validateEmployeeId, validateEmployee, validateUpdateEmployee, validateEmployeeByRole } = require('../../validators/employee.schema.validator');

router.get('/', authorize('Administrator'), employees.getAll);

router.get('/:id', authorize('Administrator'), validateEmployeeId, employees.get);

router.post('/', authorize('Administrator'), validateEmployee, employees.create);

router.put('/:id', authorize('Administrator'), validateUpdateEmployee, employees.update);

router.patch('/:id', authorize('Administrator'), validateEmployeeId, employees.updateStatus);

router.get('/:role/branch/:branchId', authorize('Administrator,Sales Executive'), validateEmployeeByRole, employees.getEmployeeByRole);

module.exports = router;