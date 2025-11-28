const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');

router.get('/', fundController.getAllFunds);
router.post('/allocate', fundController.allocateFund);
router.post('/release', fundController.releaseFund);

module.exports = router;
