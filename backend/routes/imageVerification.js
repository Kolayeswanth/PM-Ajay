const express = require('express');
const router = express.Router();
const {
    upload,
    verifySingleImage,
    verifyMultipleImages,
    getVerificationStats
} = require('../controllers/imageVerificationController');

/**
 * @route   POST /api/verify-image/single
 * @desc    Verify a single image for authenticity
 * @access  Private (authenticated contractors)
 */
router.post('/single', upload.single('image'), verifySingleImage);

/**
 * @route   POST /api/verify-image/multiple
 * @desc    Verify multiple images for authenticity
 * @access  Private (authenticated contractors)
 */
router.post('/multiple', upload.array('images', 10), verifyMultipleImages);

/**
 * @route   GET /api/verify-image/stats
 * @desc    Get image verification statistics
 * @access  Private (admin only)
 */
router.get('/stats', getVerificationStats);

module.exports = router;
