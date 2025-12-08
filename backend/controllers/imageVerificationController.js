const aiDetectionService = require('../services/aiDetectionService');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Max 10 files at once
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    }
});

/**
 * Verify single image
 */
const verifySingleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const result = await aiDetectionService.analyzeImage(
            req.file.buffer,
            req.file.originalname
        );

        res.json({
            success: true,
            result,
            filename: req.file.originalname
        });
    } catch (error) {
        console.error('Image verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify image',
            error: error.message
        });
    }
};

/**
 * Verify multiple images
 */
const verifyMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        const images = req.files.map(file => ({
            buffer: file.buffer,
            filename: file.originalname
        }));

        const results = await aiDetectionService.analyzeMultipleImages(images);

        res.json({
            success: true,
            summary: results,
            message: `Verified ${results.total} images - ${results.authentic} authentic, ${results.warnings} with warnings, ${results.rejected} rejected`
        });
    } catch (error) {
        console.error('Batch verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify images',
            error: error.message
        });
    }
};

/**
 * Get verification statistics
 */
const getVerificationStats = async (req, res) => {
    try {
        // This would query database for historical verification data
        // For now, returning mock data
        const stats = {
            totalVerified: 1250,
            authenticImages: 980,
            rejectedImages: 45,
            warningImages: 225,
            averageConfidence: 72.5,
            lastUpdated: new Date().toISOString()
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

module.exports = {
    upload,
    verifySingleImage,
    verifyMultipleImages,
    getVerificationStats
};
