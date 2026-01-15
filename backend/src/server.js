const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const expressWinston = require('express-winston');
require('dotenv').config();

const config = require('./config');
const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting with environment-specific configuration
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health'
});

app.use('/api', limiter);

// Body parsing middleware with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (only in non-test environments)
if (config.server.env !== 'test') {
  app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, _res) { 
      // Skip logging for health checks and static assets
      return req.url === '/health' || req.url.startsWith('/static');
    }
  }));
}

// Health check endpoint with detailed status
app.get('/health', async (req, res) => {
  try {
    const { aiService } = require('./services/aiService');
    const { cacheManager } = require('./services/cacheService');
    
    // Check AI service health
    const aiHealth = await aiService.getHealthStatus();
    
    // Get cache statistics
    const cacheStats = cacheManager.getGlobalStats();
    
    const healthStatus = {
      status: aiHealth.available ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.server.env,
      services: {
        ai: aiHealth,
        cache: {
          status: 'healthy',
          stats: cacheStats
        }
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    const statusCode = aiHealth.available ? 200 : 503;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// API routes
app.use('/api', apiRoutes);

// Error logging (only in non-test environments)
if (config.server.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP Error {{req.method}} {{req.url}}'
  }));
}

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections, clear caches, etc.
    const { cacheManager } = require('./services/cacheService');
    cacheManager.clearAll();
    
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start server
const server = app.listen(config.server.port, () => {
  logger.info(`AI Feature Builder Backend started`, {
    port: config.server.port,
    environment: config.server.env,
    corsOrigin: config.server.corsOrigin,
    aiModel: config.openai.model,
    logLevel: config.logging.level
  });
});

module.exports = app;