const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory to upload to Supabase
const upload = multer({ storage: storage });

router.post('/create', upload.array('documents', 5), proposalController.createProposal);
router.get('/district/:districtId', proposalController.getProposalsByDistrict);
router.get('/state', proposalController.getProposalsByState);
router.patch('/:id/status', proposalController.updateProposalStatus);

module.exports = router;
