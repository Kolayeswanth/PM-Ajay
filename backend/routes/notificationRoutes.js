const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Define notification routes
router.post('/send-allocation', notificationController.sendAllocationNotification);
router.post('/send-release', notificationController.sendReleaseNotification);
router.get('/poll', notificationController.getNotifications);

module.exports = router;
