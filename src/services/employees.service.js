const mongoose = require('mongoose');
const User = require('../models/User');

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
        let foundEmployee = await User.findById(id);
        if(!foundEmployee){
            throw {
                status: 404,
                message: "El empleado que buscas no existe"
            }
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
        const repeatedEmployee = await User.findOne({ 'employee.username': employee.username });
        if (repeatedEmployee) {
            throw {
                status: 400,
                message: "El empleado ya se encuentra registrado"
            };
        }

        const newUser = new User({
            fullname: employee.fullname,
            birthdate: employee.birthdate,
            phone: employee.phone,
            password: employee.password,
            username: employee.username,
            status: 'Active',
            employee: {
                username: employee.username,
                role: employee.employee.role,
                hiredDate: employee.employee.hiredDate,
                branch: employee.employee.branch
            }
        });

        return await newUser.save();
    } catch (error) {
        throw error;
    }
};

EmployeesService.updateEmployee = async function (id, employee, isStatusChanged){
    try {
        let foundEmployee = await User.findById(id);
        if (!foundEmployee) {
            throw {
                status: 404,
                message: "El empleado que quieres editar no existe"
            };
        }

        let updatedEmployee = await User.findOneAndUpdate({ _id: id }, { $set: employee }, { new: true });
        foundEmployee = await User.findById(updatedEmployee._id);
        if (isStatusChanged) {
            await updateEmployeeStatus(foundEmployee);
        }
        return foundEmployee;
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