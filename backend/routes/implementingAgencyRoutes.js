const express = require('express');
const router = express.Router();
const implementingAgencyController = require('../controllers/implementingAgencyController');

// Agency self-registration route
router.post('/register', implementingAgencyController.registerAgency);

// Get pending registrations (for State Admin)
router.get('/registrations/pending', implementingAgencyController.getPendingRegistrations);

// Approve/Reject registration
router.patch('/registrations/:id/approve', implementingAgencyController.approveRegistration);
router.patch('/registrations/:id/reject', implementingAgencyController.rejectRegistration);

router.get('/', implementingAgencyController.getAllImplementingAgencies);
router.post('/', implementingAgencyController.addImplementingAgency);
router.put('/:id', implementingAgencyController.updateImplementingAgency);
router.patch('/:id/activate', implementingAgencyController.activateImplementingAgency);
router.delete('/:id', implementingAgencyController.deleteImplementingAgency);

module.exports = router;
