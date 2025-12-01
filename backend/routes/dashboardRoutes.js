const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/ministry-stats', dashboardController.getMinistryDashboardStats);
router.get('/state-stats', dashboardController.getStateDashboardStats);
router.get('/district-stats/:districtId', dashboardController.getDistrictStats);


module.exports = router;
