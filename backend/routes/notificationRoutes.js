const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


// Define notification routes
router.post('/send-allocation', notificationController.sendAllocationNotification);
router.post('/send-release', notificationController.sendReleaseNotification);
router.post('/send-activation-email', notificationController.sendActivationWhatsApp);

module.exports = router;
