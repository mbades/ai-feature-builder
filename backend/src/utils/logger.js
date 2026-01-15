const winston = require('winston');
const config = require('../config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} ${level}: ${message} ${metaStr}`;
    }
  )
);

// Create logs directory if it doesn't exist (only in development)
const fs = require('fs').promises;
const path = require('path');

async function ensureLogsDirectory() {
  // Skip in production - no file logging
  if (config.server.env === 'production') {
    return;
  }
  
  try {
    await fs.access(config.paths.logs);
  } catch (error) {
    // Directory doesn't exist, create it
    try {
      await fs.mkdir(config.paths.logs, { recursive: true });
    } catch (mkdirError) {
      console.warn('Could not create logs directory:', mkdirError.message);
    }
  }
}

// Initialize logs directory asynchronously (only in development)
if (config.server.env !== 'production') {
  ensureLogsDirectory().catch(error => {
    console.warn('Failed to create logs directory:', error.message);
  });
}

// Define transports based on environment
const getTransports = () => {
  const transports = [];

  // Console transport (always enabled)
  transports.push(
    new winston.transports.Console({
      format: config.server.env === 'production' ? logFormat : consoleFormat,
      level: config.logging.level
    })
  );

  // File transports (disabled in test and production environments for Railway/Vercel)
  if (config.server.env !== 'test' && config.server.env !== 'production') {
    try {
      // Error log file
      transports.push(
        new winston.transports.File({
          filename: path.join(config.paths.logs, 'error.log'),
          level: 'error',
          format: logFormat,
          maxsize: config.logging.maxSize,
          maxFiles: config.logging.maxFiles
        })
      );

      // Combined log file
      transports.push(
        new winston.transports.File({
          filename: path.join(config.paths.logs, 'combined.log'),
          format: logFormat,
          maxsize: config.logging.maxSize,
          maxFiles: config.logging.maxFiles
        })
      );
    } catch (error) {
      console.warn('File logging disabled - using console only:', error.message);
    }
  }

  return transports;
};

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format: logFormat,
  transports: getTransports(),
  // Do not exit on handled exceptions
  exitOnError: false
  // Exception and rejection handlers disabled in production (no file access)
});

// Add request correlation ID to logs
logger.addRequestId = (requestId) => {
  return logger.child({ requestId });
};

// Performance logging helper
logger.performance = (operation, startTime, metadata = {}) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, {
    duration,
    operation,
    ...metadata
  });
  return duration;
};

// Structured error logging
logger.logError = (error, context = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...context
  });
};

// API request logging helper
logger.logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    contentLength: res.get('Content-Length')
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request Error', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

module.exports = logger;