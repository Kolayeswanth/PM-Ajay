const express = require('express');
const router = express.Router();
const pushTokenController = require('../controllers/pushTokenController');

// Route to register a push token
router.post('/register', pushTokenController.registerPushToken);

module.exports = router;
