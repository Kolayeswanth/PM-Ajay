const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Define notification routes
router.post('/send-allocation', notificationController.sendAllocationNotification);

module.exports = router;
