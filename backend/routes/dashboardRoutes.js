const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get Ministry Dashboard statistics
router.get('/ministry-stats', dashboardController.getMinistryStats);

module.exports = router;
