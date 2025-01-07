const router = require('express').Router();
const incident = require('../../controllers/incidents.controller');
const authorize = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

router.get('/', authorize('Sales Executive'), incident.getAll);

router.get('/:id', authorize('Customer,Sales Executive'), incident.get);

router.post('/', upload.single("file"), authorize('Customer'),  incident.create);

router.get('/:id/photo', authorize('Customer,Sales Executive'), incident.getPhoto);

module.exports = router;