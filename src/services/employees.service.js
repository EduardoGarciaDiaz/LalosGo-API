const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const EmployeesService = {};

EmployeesService.getAllEmployees = async function (searchQuery) {
    const filters = { employee: { $exists: true } }; 
    if (searchQuery) {
        filters['employee.username'] = {
            $regex: searchQuery,
            $options: 'i'
        };
    }

    return await User.find(filters);
};

EmployeesService.getEmployee = async function (id) {
    try{
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        
        let foundEmployee = await User.findById(id);

        if(!foundEmployee){
            return null;
        }
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
            return null;
        }

        const newUser = new User({
            fullname: employee.fullname,
            email: employee.email,
            birthdate: employee.birthdate,
            phone: employee.phone,
            password: bcrypt.hash(employee.password, 10),
            username: employee.username,
            status: 'Active',
            employee: {
                username: employee.username,
                role: employee.employee.role,
                hiredDate: employee.employee.hiredDate,
                branch: employee.employee.branch
            }
        });

        await newUser.save();

        const savedUser = await User.findById(newUser._id).select('-password');

        return savedUser;

    } catch (error) {
        if (!error.status) {
            error.status = 500;
        }
        throw error;
    }
};

EmployeesService.updateEmployee = async function (id, employee, isStatusChanged) {
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
            return null;
        }

        await User.findOneAndUpdate(
            { _id: id },
            { $set: employee },
            { new: true }
        );

        if (isStatusChanged) {
            await updateEmployeeStatus(updatedEmployee);
        }

        const updatedEmployee = await User.findById(id).select('-password');

    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            };
        }
        throw {
            status: 500,
            message: "Error interno del servidor"
        };
    }
};

async function updateEmployeeStatus(employee) {
    try {
        let status = employee.status === 'Active' ? 'Inactive' : 'Active';
        await User.findOneAndUpdate({ _id: employee._id }, { $set: { status: status } });
    }
    catch (error) {
        throw error;
    }
}

module.exports = EmployeesService;