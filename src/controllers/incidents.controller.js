const IncidentService = require('../services/incidents.service');

let self = {}

self.getAll = async function (req, res, next) {
    try {
        const data = await IncidentService.getAllIncidents();
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

        const incident = req.body;
        const data = await IncidentService.saveIncident(incident);
        return res.status(201).json(data);
    } catch (error) {
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
        
        res.status(200).contentType('image/jpeg').send(photo);
    } catch (error) {
        next(error);
    }
}

module.exports = self;