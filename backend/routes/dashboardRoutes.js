const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get Ministry Dashboard statistics
router.get('/ministry-stats', dashboardController.getMinistryStats);

// Get District Dashboard statistics
router.get('/district-stats/:districtId', dashboardController.getDistrictStats);

module.exports = router;
