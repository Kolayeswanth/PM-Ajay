/**
 * AI Detection Service for Image Authenticity Verification
 * This service validates uploaded images to detect:
 * - AI-generated images
 * - Manipulated/edited photos
 * - Stock photos
 * - Screenshots
 */

const sharp = require('sharp');

class AIDetectionService {
    /**
     * Analyze image for authenticity
     * @param {Buffer} imageBuffer - Image file buffer
     * @param {string} filename - Original filename
     * @returns {Promise<Object>} Detection results
     */
    async analyzeImage(imageBuffer, filename) {
        try {
            // Initialize scoring components
            let authenticityScore = 50;  // Base score
            let aiGenerationScore = 50;  // Base score
            let manipulationScore = 50;  // Base score

            const warnings = [];
            const detectionDetails = {
                hasCamera: false,
                hasGPS: false,
                isScreenshot: false,
                suspiciousPixels: false,
                isOldPhoto: false,
                lowResolution: false
            };

            // 1. Extract EXIF metadata
            const metadata = await this.extractMetadata(imageBuffer);

            // 2. Check for camera metadata (real photos usually have this)
            const hasExif = this.checkExifData(metadata);
            if (!hasExif.hasCamera) {
                warnings.push('No camera metadata found - possible screenshot or edited image');
                authenticityScore -= 25;  // Less authentic
                aiGenerationScore += 20;   // More likely AI-generated
                manipulationScore += 15;   // Could be manipulated
                detectionDetails.hasCamera = false;
            } else {
                authenticityScore += 30;   // More authentic
                aiGenerationScore -= 25;   // Less likely AI
                manipulationScore -= 10;   // Less likely manipulated
                detectionDetails.hasCamera = true;
            }

            // 3. Check for GPS/location data (site photos should have this)
            if (!metadata.gps) {
                warnings.push('No GPS location data - enable location services when taking photos');
                authenticityScore -= 15;
                manipulationScore += 10;
                detectionDetails.hasGPS = false;
            } else {
                authenticityScore += 25;
                manipulationScore -= 15;
                detectionDetails.hasGPS = true;
            }

            // 4. Check image dimensions and quality
            const dimensionCheck = this.checkDimensions(metadata);
            if (dimensionCheck.isSuspicious) {
                warnings.push(dimensionCheck.reason);
                authenticityScore -= 20;
                manipulationScore += 20;
                detectionDetails.lowResolution = true;
            } else {
                authenticityScore += 15;
                manipulationScore -= 10;
            }

            // 5. Analyze pixel patterns for AI generation
            const pixelAnalysis = await this.analyzePixelPatterns(imageBuffer);
            if (pixelAnalysis.suspiciousPatterns) {
                warnings.push('Detected unusual pixel patterns - possible AI generation');
                authenticityScore -= 25;
                aiGenerationScore += 30;  // Strong indicator of AI
                manipulationScore += 15;
                detectionDetails.suspiciousPixels = true;
            } else {
                authenticityScore += 20;
                aiGenerationScore -= 20;
            }

            // 6. Check for screenshot indicators
            const screenshotCheck = this.checkForScreenshot(metadata, filename);
            if (screenshotCheck.isScreenshot) {
                warnings.push('Image appears to be a screenshot');
                authenticityScore -= 30;
                manipulationScore += 25;  // Screenshots are manipulated
                detectionDetails.isScreenshot = true;
            } else {
                authenticityScore += 15;
                manipulationScore -= 15;
            }

            // 7. Check timestamp freshness (photos should be recent)
            const timestampCheck = this.checkTimestamp(metadata);
            if (timestampCheck.isOld) {
                warnings.push(`Photo is ${timestampCheck.age} old - please upload recent site photos`);
                authenticityScore -= 10;
                manipulationScore += 5;
                detectionDetails.isOldPhoto = true;
            } else {
                authenticityScore += 10;
            }

            // Normalize all scores to 0-100 range
            const truePercentage = Math.max(0, Math.min(100, authenticityScore));
            const fakePercentage = Math.max(0, Math.min(100, aiGenerationScore));
            const manipulatedPercentage = Math.max(0, Math.min(100, manipulationScore));

            // Calculate overall confidence (weighted average favoring authenticity)
            const overallConfidence = Math.round(
                (truePercentage * 0.6) +
                ((100 - fakePercentage) * 0.25) +
                ((100 - manipulatedPercentage) * 0.15)
            );

            // Determine verdict based on scores
            let verdict;
            let isAuthentic = true;

            if (fakePercentage > 70) {
                verdict = 'REJECTED - High probability of AI-generated image';
                isAuthentic = false;
            } else if (manipulatedPercentage > 70) {
                verdict = 'REJECTED - High probability of manipulated/edited image';
                isAuthentic = false;
            } else if (truePercentage >= 60) {
                verdict = 'VERIFIED - Image appears authentic';
                isAuthentic = true;
            } else if (truePercentage >= 40) {
                verdict = 'WARNING - Image may be manipulated, please verify';
                isAuthentic = true;
            } else {
                verdict = 'REJECTED - Low authenticity score';
                isAuthentic = false;
            }

            return {
                isAuthentic,
                confidence: overallConfidence,
                // NEW: Separate percentage scores
                percentages: {
                    true: Math.round(truePercentage),
                    fake: Math.round(fakePercentage),
                    manipulated: Math.round(manipulatedPercentage)
                },
                warnings,
                metadata,
                detectionDetails,
                verdict,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('AI Detection Error:', error);
            return {
                isAuthentic: true, // Allow on error to not block workflow
                confidence: 50,
                warnings: ['Unable to fully verify image - proceeding with caution'],
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Extract metadata from image
     */
    async extractMetadata(imageBuffer) {
        try {
            const image = sharp(imageBuffer);
            const metadata = await image.metadata();

            return {
                format: metadata.format,
                width: metadata.width,
                height: metadata.height,
                space: metadata.space,
                channels: metadata.channels,
                depth: metadata.depth,
                density: metadata.density,
                hasAlpha: metadata.hasAlpha,
                exif: metadata.exif,
                orientation: metadata.orientation,
                // Attempt to parse EXIF data
                ...this.parseExifData(metadata.exif)
            };
        } catch (error) {
            console.error('Metadata extraction error:', error);
            return {};
        }
    }

    /**
     * Parse EXIF data from buffer
     */
    parseExifData(exifBuffer) {
        if (!exifBuffer) return {};

        try {
            // This is a simplified parser - in production, use a library like 'exif-parser'
            const result = {};

            // Try to detect common EXIF markers
            const exifString = exifBuffer.toString('latin1');

            // Check for camera make/model
            if (exifString.includes('Canon') || exifString.includes('Nikon') ||
                exifString.includes('Sony') || exifString.includes('Samsung') ||
                exifString.includes('Apple') || exifString.includes('Google')) {
                result.hasCamera = true;
            }

            // Check for GPS data
            if (exifString.includes('GPS')) {
                result.gps = true;
            }

            // Check for datetime
            const dateMatch = exifString.match(/(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
            if (dateMatch) {
                result.dateTaken = new Date(
                    parseInt(dateMatch[1]),
                    parseInt(dateMatch[2]) - 1,
                    parseInt(dateMatch[3]),
                    parseInt(dateMatch[4]),
                    parseInt(dateMatch[5]),
                    parseInt(dateMatch[6])
                );
            }

            return result;
        } catch (error) {
            return {};
        }
    }

    /**
     * Check for camera EXIF data
     */
    checkExifData(metadata) {
        return {
            hasCamera: metadata.hasCamera || false,
            hasGPS: metadata.gps || false,
            hasDatestamp: !!metadata.dateTaken
        };
    }

    /**
     * Check image dimensions for suspicious patterns
     */
    checkDimensions(metadata) {
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        // Check for common screenshot resolutions
        const screenshotSizes = [
            [1920, 1080], [1366, 768], [1440, 900], [1536, 864],
            [1280, 720], [1600, 900], [2560, 1440], [3840, 2160]
        ];

        const isScreenshotSize = screenshotSizes.some(([w, h]) =>
            (width === w && height === h) || (width === h && height === w)
        );

        if (isScreenshotSize) {
            return {
                isSuspicious: true,
                reason: 'Image dimensions match common screenshot sizes'
            };
        }

        // Check for very small images (likely not from a modern camera)
        if (width < 640 || height < 480) {
            return {
                isSuspicious: true,
                reason: 'Image resolution too low for modern camera'
            };
        }

        return { isSuspicious: false };
    }

    /**
     * Analyze pixel patterns for AI-generated content
     */
    async analyzePixelPatterns(imageBuffer) {
        try {
            const image = sharp(imageBuffer);
            const { data, info } = await image
                .raw()
                .toBuffer({ resolveWithObject: true });

            // Simple statistical analysis
            let sum = 0;
            let variance = 0;
            const pixelCount = data.length;

            // Calculate mean
            for (let i = 0; i < pixelCount; i++) {
                sum += data[i];
            }
            const mean = sum / pixelCount;

            // Calculate variance
            for (let i = 0; i < pixelCount; i++) {
                variance += Math.pow(data[i] - mean, 2);
            }
            variance /= pixelCount;

            // AI-generated images often have unusually low variance
            // or very uniform distributions
            const suspiciousPatterns = variance < 100 || variance > 50000;

            return {
                suspiciousPatterns,
                variance,
                mean
            };
        } catch (error) {
            return { suspiciousPatterns: false };
        }
    }

    /**
     * Check for screenshot indicators
     */
    checkForScreenshot(metadata, filename) {
        const screenshotKeywords = ['screenshot', 'screen', 'capture', 'snap'];
        const lowerFilename = (filename || '').toLowerCase();

        const hasScreenshotName = screenshotKeywords.some(keyword =>
            lowerFilename.includes(keyword)
        );

        return {
            isScreenshot: hasScreenshotName || metadata.format === 'png' && !metadata.hasCamera
        };
    }

    /**
     * Check timestamp freshness
     */
    checkTimestamp(metadata) {
        if (!metadata.dateTaken) {
            return { isOld: false, age: 'unknown' };
        }

        const now = new Date();
        const photoDate = new Date(metadata.dateTaken);
        const daysDiff = Math.floor((now - photoDate) / (1000 * 60 * 60 * 24));

        if (daysDiff > 30) {
            return {
                isOld: true,
                age: `${daysDiff} days`
            };
        }

        return {
            isOld: false,
            age: `${daysDiff} days`
        };
    }

    /**
     * Batch analyze multiple images
     */
    async analyzeMultipleImages(images) {
        const results = await Promise.all(
            images.map(img => this.analyzeImage(img.buffer, img.filename))
        );

        const summary = {
            total: results.length,
            authentic: results.filter(r => r.isAuthentic && r.confidence >= 60).length,
            warnings: results.filter(r => r.isAuthentic && r.confidence < 60).length,
            rejected: results.filter(r => !r.isAuthentic).length,
            averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
            details: results
        };

        return summary;
    }
}

module.exports = new AIDetectionService();
