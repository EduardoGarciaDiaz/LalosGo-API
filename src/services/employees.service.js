const mongoose = require('mongoose');
const User = require('../models/User');
const Branch = require('../models/Branch');
const bcrypt = require('bcrypt');

const EmployeesService = {};

EmployeesService.getAllEmployees = async function () {
    try {
        return await User.find({ employee: { $exists: true } })
            .select('-password')
            .populate({
                path: 'employee.branch',
                select: 'name'
            });
    } catch (error) {
        throw error;
    }
};

EmployeesService.getEmployee = async function (id) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Empleado no encontrado');
            error.status = 404;
            throw error;
        }

        let foundEmployee = await User.findById(id).select('-password');

        return foundEmployee;
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
};

EmployeesService.saveEmployee = async function (employee) {
    try {
        const repeatedEmployee = await User.findOne({
            $or: [
                { username: employee.username },
                { email: employee.email },
                { phone: employee.phone }
            ]
        });

        if (repeatedEmployee) {
            const error = new Error('El correo, username o número telefónico ya se encuentran registrados');
            error.status = 400;
            throw error;
        }

        const newUser = new User({
            fullname: employee.fullname,
            email: employee.email,
            birthdate: employee.birthdate,
            phone: employee.phone,
            password: bcrypt.hashSync(employee.password, 10),
            username: employee.username,
            status: 'Active',
            employee: {
                role: employee.employee.role,
                hiredDate: employee.employee.hiredDate,
                branch: employee.employee.branch
            }
        });

        await newUser.save();

        const savedUser = await User.findById(newUser._id).select('-password');

        return savedUser;

    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
};

EmployeesService.updateEmployee = async function (id, employee) {
    try {
        const repeatedEmployee = await User.findOne({
            $or: [
                { username: employee.username },
                { email: employee.email },
                { phone: employee.phone }
            ],
            _id: { $ne: id }
        });

        if (repeatedEmployee) {
            const error = new Error('El correo, username o número telefónico ya se encuentran registrados');
            error.status = 400;
            throw error;
        }

        await User.findOneAndUpdate(
            { _id: id },
            { $set: employee },
            { new: true }
        );
        
        const updatedEmployee = await User.findById(id).select('-password');
        return updatedEmployee;
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            };
        }
        throw error;
    }
};

EmployeesService.updateEmployeeStatus = async function (employee) {
    try {
        let status = employee.status === 'Active' ? 'Inactive' : 'Active';
        await User.findOneAndUpdate({ _id: employee._id }, { $set: { status: status } });
    }
    catch (error) {
        throw error;
    }
}

EmployeesService.getEmployeeByRole = async function (branchId, role) {
    try {
        const branchFound = await Branch.findById(branchId);

        if (!branchFound) {
            throw {
                status: 404,
                message: "sucursal no encontrado"
            };
        }

        const foundEmployees = await User.find({
            'employee.branch': branchId, 
            'employee.role': role 
        }).select('-password');

        if (foundEmployees.length === 0) {
            throw {
                status: 404,
                message: "No se encontraron empleados con el rol solicitado en esta sucursal"
            };
        }

        return foundEmployees;
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
};

module.exports = EmployeesService;