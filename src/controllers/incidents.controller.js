const IncidentService = require('../services/incidents.service');
const fs = require("fs")
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

let self = {}

self.getAll = async function (req, res, next) {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, jwtSecret);
        const employeeId = decodedToken.id;

        const data = await IncidentService.getAllIncidents(employeeId);
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

self.get = async function (req, res, next) {
    try {
        const { id } = req.params;
        const data = await IncidentService.getIncident(id);
        if (!data) {
            return res.status(404).json({ message: 'Incidente no encontrado' });
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

self.create = async function (req, res, next) {
    try {
        if (req.file == undefined) {
            return res.status(400).json('Por favor seleccione una imagen');
        }

        const incident = {};
        incident.description = req.body.description;
        incident.filename = req.file.filename;
        incident.date = req.body.date;
        incident.orderId = req.body.orderId;
        incident.mime = req.file.mimetype;

        const data = await IncidentService.saveIncident(incident);
        return res.status(201).json(data);
    } catch (error) {
        if (req.file) {
            fs.existsSync("uploads/" + req.file.filename) && fs.unlinkSync("uploads/" + req.file.filename)
        }
        next(error);
    }
}

self.getPhoto = async function (req, res, next) {
    try {
        const { id } = req.params;
        const data = await IncidentService.getIncident(id);
        if (!data) {
            return res.status(404).json({ message: 'Incidente no encontrado' });
        }

        let photo = fs.readFileSync("uploads/" + data.photo)

        res.status(200).contentType(data.mime).send(photo);
    } catch (error) {
        next(error);
    }
}

module.exports = self;