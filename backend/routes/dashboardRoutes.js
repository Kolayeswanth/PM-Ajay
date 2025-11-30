const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/ministry-stats', dashboardController.getMinistryDashboardStats);
router.get('/state-stats', dashboardController.getStateDashboardStats);


module.exports = router;
