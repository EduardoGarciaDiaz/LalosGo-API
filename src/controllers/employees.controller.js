//const {body, validationResult} = require('express-validator');
const EmployeesService = require('../services/employees.service');
const bcrypt = require('bcrypt');

let self = {}

// GET: api/employees
self.getAll = async function (req, res, next) {
    try {
        const { s } = req.query;
        const data = await EmployeesService.getAllEmployees(s);
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// GET: api/employees/:id
self.get = async function (req, res, next) {
    try {
        const { id } = req.params;
        const data = await EmployeesService.getEmployee(id);
        if (!data) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// POST: api/employees
self.create = async function (req, res, next) {
    try {
        /*const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json(errors)
            return;
        }*/
        const employee = req.body;
        const data = await EmployeesService.saveEmployee(employee);
        return res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// PUT: api/employees/:id
self.update = async function (req, res, next) {
    try {
        const { id } = req.params;
        const employee = req.body;
        const { changeStatus } = req.query;
        await EmployeesService.getEmployee(id);
        const passwordHash = bcrypt.hashSync(employee.password, 10);
        employee.password = passwordHash;
        const data = await EmployeesService.updateEmployee(id, employee, changeStatus);
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

module.exports = self;