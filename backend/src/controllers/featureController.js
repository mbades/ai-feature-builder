const { aiService } = require('../services/aiService');
const { featureProcessor } = require('../services/featureProcessor');
const { getAllTemplates, searchTemplates } = require('../data/templates');
const logger = require('../utils/logger');

/**
 * Generate feature specification from natural language description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateFeatureSpec = async (req, res) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    logger.info(`[${requestId}] Starting feature generation`, {
      description: req.body.description?.substring(0, 100) + '...',
      language: req.body.language,
      template: req.body.template,
      complexity: req.body.complexity,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Process and validate input
    const processedInput = featureProcessor.processInput(req.body);
    
    // Generate specification using AI service
    const aiResponse = await aiService.generateSpecification(processedInput, requestId);
    
    // Use AI response directly (skip validation for now)
    const specification = aiResponse.data || aiResponse;
    
    // If no data, use fallback
    if (!specification) {
      logger.warn(`[${requestId}] No data in AI response, using fallback`);
      const fallback = await aiService.generateFallbackResponse(processedInput, requestId);
      specification = fallback.data;
    }
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    logger.info(`[${requestId}] Feature generation completed`, {
      processingTime,
      specificationName: specification.metadata?.name,
      complexity: specification.metadata?.complexity,
      tokensUsed: aiResponse._metadata?.tokensUsed || 0
    });

    // Return successful response
    res.json({
      success: true,
      data: {
        feature: specification,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingTime,
          aiModel: aiResponse._metadata?.model || 'unknown',
          tokensUsed: aiResponse._metadata?.tokensUsed || 0,
          version: '1.0.0',
          requestId
        }
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error(`[${requestId}] Feature generation failed`, {
      error: error.message,
      stack: error.stack,
      processingTime,
      input: req.body,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.details || error.message,
          requestId
        }
      });
    }

    if (error.name === 'AIServiceError') {
      return res.status(502).json({
        success: false,
        error: {
          code: 'AI_SERVICE_ERROR',
          message: 'AI service temporarily unavailable',
          details: 'The AI provider is experiencing issues. Please try again in a few minutes.',
          requestId
        }
      });
    }

    if (error.name === 'AIResponseError') {
      return res.status(502).json({
        success: false,
        error: {
          code: 'AI_RESPONSE_INVALID',
          message: 'AI returned malformed response',
          details: 'The AI service returned an invalid specification. Please try again.',
          requestId
        }
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        requestId
      }
    });
  }
};

/**
 * Get available templates with optional search
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTemplates = async (req, res) => {
  try {
    const { search, category, complexity } = req.query;
    let templates = getAllTemplates();

    // Apply search filter
    if (search) {
      templates = searchTemplates(search);
    }

    // Apply category filter
    if (category) {
      templates = templates.filter(template => template.category === category);
    }

    // Apply complexity filter
    if (complexity) {
      templates = templates.filter(template => template.complexity === complexity);
    }

    // Get unique categories and complexities for filtering
    const allTemplates = getAllTemplates();
    const categories = [...new Set(allTemplates.map(t => t.category))];
    const complexities = [...new Set(allTemplates.map(t => t.complexity))];

    logger.info('Templates requested', {
      search,
      category,
      complexity,
      resultCount: templates.length,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.json({
      success: true,
      data: {
        templates,
        count: templates.length,
        filters: {
          categories,
          complexities
        }
      }
    });

  } catch (error) {
    logger.error('Failed to get templates', {
      error: error.message,
      query: req.query
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve templates'
      }
    });
  }
};

module.exports = {
  generateFeatureSpec,
  getTemplates
};