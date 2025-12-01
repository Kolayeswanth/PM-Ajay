const express = require('express');
const router = express.Router();
const stateAdminController = require('../controllers/stateAdminController');

// Get all states (must be before /:id routes if any GET /:id existed, but safe here)
router.get('/states', stateAdminController.getAllStates);

// Get districts by state
router.get('/districts', stateAdminController.getDistricts);

// Get all state admins
router.get('/', stateAdminController.getAllStateAdmins);

// Add new state admin
router.post('/', stateAdminController.addStateAdmin);

// Update state admin
router.put('/:id', stateAdminController.updateStateAdmin);

// Activate state admin
router.patch('/:id/activate', stateAdminController.activateStateAdmin);

// Deactivate state admin
router.patch('/:id/deactivate', stateAdminController.deactivateStateAdmin);

// Delete state admin (hard delete)
router.delete('/:id', stateAdminController.deleteStateAdmin);

module.exports = router;
