const config = require('../config');
const logger = require('../utils/logger');

/**
 * Handle 404 Not Found errors
 */
const notFoundHandler = (req, res, _next) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      path: req.url,
      method: req.method
    }
  });
};

/**
 * Global error handler with secure error reporting
 */
const errorHandler = (err, req, res, _next) => {
  // Generate unique error ID for tracking
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log the error with full context (server-side only)
  logger.error('Unhandled error', {
    errorId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types with secure responses
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
        errorId
      }
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload too large',
        errorId
      }
    });
  }

  // Handle Joi validation errors (if they slip through)
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        errorId
      }
    });
  }

  // Handle OpenAI API errors without exposing internal details
  if (err.code && err.code.startsWith('openai_')) {
    return res.status(502).json({
      success: false,
      error: {
        code: 'AI_SERVICE_ERROR',
        message: 'AI service temporarily unavailable',
        errorId
      }
    });
  }

  // Handle rate limiting errors
  if (err.code === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: err.retryAfter || 60,
        errorId
      }
    });
  }

  // Default server error with minimal information exposure
  const statusCode = err.statusCode || err.status || 500;
  const response = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      errorId
    }
  };

  // Only include additional details in development (and sanitize them)
  if (config.server.env === 'development') {
    response.error.details = {
      message: err.message,
      // Don't include full stack trace even in development
      type: err.constructor.name
    };
  }

  res.status(statusCode).json(response);
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add HSTS in production
  if (config.server.env === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

/**
 * Request timeout middleware
 */
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', {
          method: req.method,
          url: req.url,
          timeout: timeoutMs,
          ip: req.ip
        });
        
        res.status(408).json({
          success: false,
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'Request timeout'
          }
        });
      }
    }, timeoutMs);

    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
  securityHeaders,
  requestTimeout
};