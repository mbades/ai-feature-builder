const Joi = require('joi');
const config = require('../config');
const logger = require('../utils/logger');
const { inputSanitizer } = require('../utils/sanitizer');

// Validation schema for generate-spec request
const generateSpecSchema = Joi.object({
  description: Joi.string()
    .min(config.validation.minDescriptionLength)
    .max(config.validation.maxDescriptionLength)
    .required()
    .messages({
      'string.min': `Description must be at least ${config.validation.minDescriptionLength} characters long`,
      'string.max': `Description must not exceed ${config.validation.maxDescriptionLength} characters`,
      'any.required': 'Description is required'
    }),
  
  language: Joi.string()
    .valid(...config.validation.allowedLanguages)
    .default('it')
    .messages({
      'any.only': `Language must be one of: ${config.validation.allowedLanguages.join(', ')}`
    }),
  
  template: Joi.string()
    .valid(...config.validation.allowedTemplates)
    .optional()
    .messages({
      'any.only': `Template must be one of: ${config.validation.allowedTemplates.join(', ')}`
    }),
  
  complexity: Joi.string()
    .valid(...config.validation.allowedComplexities)
    .default('medium')
    .messages({
      'any.only': `Complexity must be one of: ${config.validation.allowedComplexities.join(', ')}`
    }),
  
  includeTests: Joi.boolean()
    .default(false)
});

/**
 * Middleware to validate generate-spec request with advanced sanitization
 */
const validateGenerateRequest = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Rate limit check for sanitization operations
  if (!inputSanitizer.checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'SANITIZATION_RATE_LIMIT',
        message: 'Too many requests. Please slow down.',
        retryAfter: 60
      }
    });
  }

  try {
    // Pre-sanitize the request body
    const sanitizedBody = inputSanitizer.sanitizeObject(req.body, {
      allowHtml: false,
      maxLength: config.validation.maxDescriptionLength + 100, // Small buffer
      preserveNewlines: true,
      logSuspicious: true
    });

    // Validate the sanitized data
    const { error, value } = generateSpecSchema.validate(sanitizedBody, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Request validation failed', {
        errors: validationErrors,
        requestBody: sanitizedBody,
        userAgent: req.get('User-Agent'),
        ip: clientIp,
        sanitizationApplied: true
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: validationErrors
        }
      });
    }

    // Additional security validation
    const securityCheck = performSecurityValidation(value, clientIp);
    if (!securityCheck.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SECURITY_VALIDATION_FAILED',
          message: securityCheck.error
        }
      });
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    req.sanitizationApplied = true;
    next();

  } catch (error) {
    logger.error('Validation middleware error', {
      error: error.message,
      stack: error.stack,
      ip: clientIp
    });

    return res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed'
      }
    });
  }
};

/**
 * Perform additional security validation
 * @param {Object} data - Validated data
 * @param {string} clientIp - Client IP address
 * @returns {Object} - Security validation result
 */
function performSecurityValidation(data, clientIp) {
  // Check description for suspicious patterns
  if (data.description) {
    // Suspicious keywords - rimossi quelli che possono apparire in testo normale
    const suspiciousKeywords = [
      '<script', '</script>', 'javascript:', 'vbscript:', 'data:text/html',
      'onerror=', 'onload=', 'onclick=', '<iframe', '</iframe>',
      'eval(', 'exec(', 'system(', 'shell_exec',
      'union select', 'drop table', 'delete from', 'insert into'
    ];

    const lowerDesc = data.description.toLowerCase();
    const foundSuspicious = suspiciousKeywords.filter(keyword => 
      lowerDesc.includes(keyword.toLowerCase())
    );

    if (foundSuspicious.length > 0) {
      logger.warn('Suspicious keywords detected in description', {
        keywords: foundSuspicious,
        ip: clientIp,
        description: data.description.substring(0, 100) + '...'
      });

      return {
        valid: false,
        error: 'La descrizione contiene contenuto potenzialmente pericoloso'
      };
    }

    // Check for excessive special characters (potential encoding attack)
    // Esclusi apostrofi, virgolette e virgole che sono normali in italiano
    const dangerousChars = (data.description.match(/[<>%&\$\{\}\[\]]/g) || []).length;
    const dangerousCharRatio = dangerousChars / data.description.length;

    // Aumentato threshold da 0.1 a 0.15 (15%) per essere meno aggressivo
    if (dangerousCharRatio > 0.15) {
      logger.warn('High dangerous character ratio detected', {
        ratio: dangerousCharRatio,
        dangerousCharCount: dangerousChars,
        totalLength: data.description.length,
        ip: clientIp
      });

      return {
        valid: false,
        error: 'La descrizione contiene troppi caratteri speciali sospetti'
      };
    }
  }

  return { valid: true };
}

/**
 * Validate description with enhanced security checks
 */
const validateDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { valid: false, error: 'Description must be a non-empty string' };
  }

  const trimmed = description.trim();
  
  if (trimmed.length < config.validation.minDescriptionLength) {
    return { 
      valid: false, 
      error: `Description must be at least ${config.validation.minDescriptionLength} characters long` 
    };
  }

  if (trimmed.length > config.validation.maxDescriptionLength) {
    return { 
      valid: false, 
      error: `Description must not exceed ${config.validation.maxDescriptionLength} characters` 
    };
  }

  // Check if description contains at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: 'Description must contain at least one letter' };
  }

  // Enhanced security validation
  const sanitized = inputSanitizer.sanitizeString(trimmed, {
    allowHtml: false,
    logSuspicious: true
  });

  // Check if sanitization changed the content significantly
  if (sanitized.length < trimmed.length * 0.8) {
    return { 
      valid: false, 
      error: 'Description contains too much potentially malicious content' 
    };
  }

  return { valid: true, description: sanitized };
};

/**
 * Validate query parameters for templates endpoint
 */
const validateTemplatesQuery = Joi.object({
  search: Joi.string().max(100).optional(),
  category: Joi.string().max(50).optional(),
  complexity: Joi.string().valid(...config.validation.allowedComplexities).optional()
});

/**
 * Middleware to validate templates query parameters
 */
const validateTemplatesRequest = (req, res, next) => {
  try {
    // Sanitize query parameters
    const sanitizedQuery = inputSanitizer.sanitizeObject(req.query, {
      allowHtml: false,
      maxLength: 100
    });

    const { error, value } = validateTemplatesQuery.validate(sanitizedQuery, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query validation failed',
          details: validationErrors
        }
      });
    }

    req.query = value;
    next();

  } catch (error) {
    logger.error('Templates validation error', {
      error: error.message,
      query: req.query
    });

    return res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Query validation failed'
      }
    });
  }
};

module.exports = {
  validateGenerateRequest,
  validateTemplatesRequest,
  validateDescription,
  generateSpecSchema,
  validateTemplatesQuery
};