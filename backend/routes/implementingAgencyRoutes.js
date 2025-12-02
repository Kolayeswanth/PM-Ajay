const express = require('express');
const router = express.Router();
const implementingAgencyController = require('../controllers/implementingAgencyController');

router.get('/', implementingAgencyController.getAllImplementingAgencies);
router.post('/', implementingAgencyController.addImplementingAgency);
router.put('/:id', implementingAgencyController.updateImplementingAgency);
router.patch('/:id/activate', implementingAgencyController.activateImplementingAgency);
router.delete('/:id', implementingAgencyController.deleteImplementingAgency);

module.exports = router;
