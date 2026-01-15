const express = require('express');
const { generateFeatureSpec, getTemplates } = require('../controllers/featureController');
const { validateGenerateRequest } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Generate feature specification endpoint
router.post('/generate-spec', validateGenerateRequest, asyncHandler(generateFeatureSpec));

// Get available templates endpoint
router.get('/templates', asyncHandler(getTemplates));

// Health check for AI service
router.get('/ai-health', asyncHandler(async (req, res) => {
  const { aiService } = require('../services/aiService');
  const healthStatus = await aiService.getHealthStatus();
  
  res.status(healthStatus.available ? 200 : 503).json({
    success: healthStatus.available,
    data: healthStatus
  });
}));

// Cache statistics endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/cache-stats', (req, res) => {
    const { cacheManager } = require('../services/cacheService');
    const stats = cacheManager.getGlobalStats();
    
    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = router;