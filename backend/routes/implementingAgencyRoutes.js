const express = require('express');
const router = express.Router();
const implementingAgencyController = require('../controllers/implementingAgencyController');

// Get all implementing agencies for a state
router.get('/', implementingAgencyController.getImplementingAgencies);

// Create new implementing agency
router.post('/', implementingAgencyController.createImplementingAgency);

// Update implementing agency
router.put('/:id', implementingAgencyController.updateImplementingAgency);

// Activate implementing agency
router.patch('/:id/activate', implementingAgencyController.activateImplementingAgency);

module.exports = router;
