const router = require('express').Router();
const incident = require('../../controllers/incidents.controller');
const authorize = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');
const { validateGetIncident, validateCreateIncident, validateGetIncidentPhoto } = require('../../validators/incident.schema.validator');

router.get('/', authorize('Sales Executive'), incident.getAll);

router.get('/:id', authorize('Customer,Sales Executive'), validateGetIncident, incident.get);

router.post('/', upload.single("file"), authorize('Customer'),  validateCreateIncident, incident.create);

router.get('/:id/photo', authorize('Customer,Sales Executive'), validateGetIncidentPhoto, incident.getPhoto);

module.exports = router;