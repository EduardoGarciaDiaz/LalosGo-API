const router = require('express').Router();
const incident = require('../../controllers/incidents.controller');
const authorize = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

router.get('/', authorize('Manager'), incident.getAll);

router.get('/:id', authorize('Customer, Manager'), incident.get);

router.post('/', authorize('Customer'), upload.single("file"), incident.create);

router.get('/:id/photo', authorize('Customer, Manager'), incident.getPhoto);

module.exports = router;