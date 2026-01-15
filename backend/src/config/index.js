const path = require('path');

/**
 * Centralized configuration management
 */
class Config {
  constructor() {
    this.validateRequiredEnvVars();
  }

  // Server Configuration
  get server() {
    return {
      port: parseInt(process.env.PORT) || 3001,
      env: process.env.NODE_ENV || 'development',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    };
  }

  // OpenAI/OpenRouter Configuration
  get openai() {
    return {
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
      model: process.env.OPENAI_MODEL || process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 4000,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.1,
      timeout: parseInt(process.env.OPENAI_TIMEOUT) || 60000,
      maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES) || 3,
      baseURL: process.env.OPENAI_BASE_URL || process.env.OPENROUTER_BASE_URL || 'https://api.openai.com/v1'
    };
  }

  // Rate Limiting Configuration
  get rateLimit() {
    return {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
    };
  }

  // Logging Configuration
  get logging() {
    return {
      level: process.env.LOG_LEVEL || 'info',
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      maxSize: process.env.LOG_MAX_SIZE || '20m'
    };
  }

  // Cache Configuration
  get cache() {
    return {
      enabled: process.env.CACHE_ENABLED !== 'false',
      ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
      maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100
    };
  }

  // Paths Configuration
  get paths() {
    return {
      prompts: path.join(__dirname, '../../docs/ai/prompts'),
      logs: path.join(__dirname, '../../logs'),
      templates: path.join(__dirname, '../data/templates')
    };
  }

  // Validation Configuration
  get validation() {
    return {
      maxDescriptionLength: parseInt(process.env.MAX_DESCRIPTION_LENGTH) || 2000,
      minDescriptionLength: parseInt(process.env.MIN_DESCRIPTION_LENGTH) || 10,
      allowedLanguages: (process.env.ALLOWED_LANGUAGES || 'it,en').split(','),
      allowedTemplates: (process.env.ALLOWED_TEMPLATES || 'crud,auth,ecommerce,api,dashboard').split(','),
      allowedComplexities: ['simple', 'medium', 'complex']
    };
  }

  /**
   * Validate required environment variables without exposing sensitive info
   */
  validateRequiredEnvVars() {
    const required = ['OPENAI_API_KEY', 'OPENROUTER_API_KEY'];
    const hasApiKey = required.some(key => process.env[key]);
    
    if (!hasApiKey) {
      // Don't expose which specific env vars are missing in production
      if (this.server.env === 'production') {
        throw new Error('Required API key environment variable is not configured');
      } else {
        throw new Error(`Missing required API key: Set either OPENAI_API_KEY or OPENROUTER_API_KEY`);
      }
    }

    // Validate environment variable formats and ranges
    this.validateEnvVarFormats();
  }

  /**
   * Validate environment variable formats and ranges
   */
  validateEnvVarFormats() {
    const errors = [];

    // Validate OpenAI configuration
    if (this.openai.maxTokens < 1 || this.openai.maxTokens > 100000) {
      errors.push('OPENAI_MAX_TOKENS must be between 1 and 100000');
    }

    if (this.openai.temperature < 0.0 || this.openai.temperature > 2.0) {
      errors.push('OPENAI_TEMPERATURE must be between 0.0 and 2.0');
    }

    // Validate rate limiting
    if (this.rateLimit.windowMs < 1000 || this.rateLimit.windowMs > 3600000) {
      errors.push('RATE_LIMIT_WINDOW_MS must be between 1000 and 3600000 (1 second to 1 hour)');
    }

    if (this.rateLimit.maxRequests < 1 || this.rateLimit.maxRequests > 10000) {
      errors.push('RATE_LIMIT_MAX_REQUESTS must be between 1 and 10000');
    }

    if (errors.length > 0) {
      throw new Error(`Environment variable validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Get configuration for specific environment
   */
  getEnvironmentConfig() {
    const baseConfig = {
      development: {
        logging: { ...this.logging, level: 'debug' },
        cache: { ...this.cache, enabled: false }
      },
      test: {
        logging: { ...this.logging, level: 'error' },
        cache: { ...this.cache, enabled: false },
        rateLimit: { ...this.rateLimit, maxRequests: 1000 }
      },
      production: {
        logging: { ...this.logging, level: 'warn' },
        cache: { ...this.cache, enabled: true }
      }
    };

    return baseConfig[this.server.env] || {};
  }
}

const config = new Config();

module.exports = config;