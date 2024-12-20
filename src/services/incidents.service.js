const mongoose = require('mongoose');
const Incident = require('../models/Incident');

const IncidentsService = {};

IncidentsService.getAllIncidents = async function () {
    try {
        return await Incident.find();
    } catch (error) {
        throw error;
    }
}

IncidentsService.getIncident = async function (id) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            const error = new Error('Incidente no encontrado');
            error.status = 404;
            throw error;
        }

        let foundIncident = await Incident.findById(id);

        return foundIncident;
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}

IncidentsService.saveIncident = async function (incident) {
    try {
        const repeatedIncident = await User.findOne({
            $or: [
                { orderNumber: incident.orderId }
            ]
        });

        if (repeatedIncident) {
            const error = new Error('Solo se puede registrar un incidente por orden');
            error.status = 400;
            throw error;
        }

        const newIncident = new Incident({
            description: incident.description,
            photo: incident.filename,
            date: incident.date,
            orderNumber: incident.orderId
        })

        return await newIncident.save();
    } catch (error) {
        if (error.status) {
            throw {
                status: error.status,
                message: error.message
            }
        }
        throw error;
    }
}