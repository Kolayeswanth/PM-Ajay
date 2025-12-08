const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get Ministry Dashboard statistics
router.get('/ministry-stats', dashboardController.getMinistryStats);

// Get District Dashboard statistics
router.get('/district-stats/:districtId', dashboardController.getDistrictStats);

// Get State Dashboard statistics
router.get('/state-stats', dashboardController.getStateStats);

// Get unique scheme components from database
router.get('/scheme-components', dashboardController.getSchemeComponents);

// Get Fund Flow data with filters
router.get('/fund-flow', dashboardController.getFundFlow);

module.exports = router;
