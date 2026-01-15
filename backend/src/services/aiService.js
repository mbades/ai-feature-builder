const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');
const { promptService } = require('./promptService');
const { getTemplateById } = require('../data/templates');
const { circuitBreakerManager } = require('./circuitBreaker');

/**
 * AI Service for generating feature specifications
 * Enhanced with circuit breaker pattern, retry logic, and better error handling
 */
class AIService {
  constructor() {
    // Support both OpenAI and OpenRouter
    const clientConfig = {
      apiKey: config.openai.apiKey,
      timeout: config.openai.timeout
    };
    
    // Add baseURL for OpenRouter
    if (config.openai.baseURL && config.openai.baseURL !== 'https://api.openai.com/v1') {
      clientConfig.baseURL = config.openai.baseURL;
    }
    
    this.openai = new OpenAI(clientConfig);
    this.retryAttempts = config.openai.maxRetries;
    
    // Log which service we're using
    const isOpenRouter = config.openai.baseURL && config.openai.baseURL.includes('openrouter');
    logger.info(`AI Service initialized`, {
      provider: isOpenRouter ? 'OpenRouter' : 'OpenAI',
      model: config.openai.model,
      baseURL: config.openai.baseURL || 'https://api.openai.com/v1'
    });
    
    // Initialize circuit breaker for AI API calls
    this.circuitBreaker = circuitBreakerManager.getCircuitBreaker('ai-api', {
      failureThreshold: 3,
      recoveryTimeout: 30000, // 30 seconds
      expectedErrors: [
        'rate_limit_exceeded', // Don't break circuit for rate limits
        'insufficient_quota'   // Don't break circuit for quota issues
      ]
    });
  }

  /**
   * Generate feature specification using OpenAI with circuit breaker protection
   * @param {Object} input - Processed input from featureProcessor
   * @param {string} requestId - Unique request identifier
   * @returns {Object} - AI generated specification
   */
  async generateSpecification(input, requestId) {
    const startTime = Date.now();
    
    try {
      // Get system prompt and template context
      const [systemPrompt, templateContext] = await Promise.all([
        promptService.getSystemPrompt(),
        input.template ? getTemplateById(input.template) : null
      ]);

      // Build user prompt with context
      const userPrompt = promptService.buildUserPrompt(input, templateContext);
      
      logger.info(`[${requestId}] Starting AI generation`, {
        model: config.openai.model,
        promptLength: userPrompt.length,
        template: input.template,
        complexity: input.complexity,
        circuitBreakerState: this.circuitBreaker.getStatus().state
      });

      // Generate with circuit breaker protection
      const response = await this.circuitBreaker.execute(
        this.generateWithRetry.bind(this),
        { systemPrompt, userPrompt, requestId }
      );

      const processingTime = Date.now() - startTime;
      
      logger.info(`[${requestId}] AI generation completed`, {
        processingTime,
        responseLength: JSON.stringify(response).length,
        tokensUsed: response._metadata?.tokensUsed || 0
      });

      return response;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Log detailed error information
      logger.error(`[${requestId}] AI generation failed - DETAILED ERROR`, {
        error: error.message,
        errorCode: error.code,
        errorStatus: error.status,
        errorType: error.constructor.name,
        processingTime,
        retryAttempts: this.retryAttempts,
        circuitBreakerState: this.circuitBreaker.getStatus().state
      });
      
      // Return fallback response instead of throwing error
      logger.warn(`[${requestId}] Returning fallback response due to AI failure`);
      return this.generateFallbackResponse(input, requestId);
    }
  }

  /**
   * Generate with retry logic and exponential backoff
   */
  async generateWithRetry({ systemPrompt, userPrompt, requestId }, attempt = 1) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new AIServiceError('Empty response from AI service');
      }

      // Clean markdown code blocks if present
      const cleanedResponse = this.cleanMarkdownResponse(response);

      // Parse and validate JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanedResponse);
        
        // Quick validation of basic structure
        const { AIResponseValidator } = require('../validators/aiResponseValidator');
        if (!AIResponseValidator.quickValidate(parsedResponse)) {
          throw new AIResponseError('AI returned incomplete JSON structure');
        }
        
        // Add metadata for tracking
        parsedResponse._metadata = {
          tokensUsed: completion.usage?.total_tokens || 0,
          model: completion.model,
          attempt
        };
        
      } catch (parseError) {
        logger.error(`[${requestId}] Failed to parse AI response as JSON`, {
          error: parseError.message,
          fullResponse: response, // Log the full response to see what's wrong
          responseLength: response.length,
          attempt
        });
        throw new AIResponseError('AI returned invalid JSON');
      }

      return parsedResponse;

    } catch (error) {
      // Retry logic for transient errors
      if (attempt < this.retryAttempts && this.isRetryableError(error)) {
        const delay = Math.min(Math.pow(2, attempt) * 1000, 10000); // Cap at 10 seconds
        
        logger.warn(`[${requestId}] Retrying AI request`, {
          attempt,
          delay,
          error: error.message
        });
        
        await this.sleep(delay);
        return this.generateWithRetry({ systemPrompt, userPrompt, requestId }, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = [
      'rate_limit_exceeded',
      'server_error',
      'timeout',
      'connection_error',
      'service_unavailable'
    ];
    
    const retryableMessages = [
      'timeout',
      'network',
      'connection',
      'temporary',
      'service unavailable'
    ];
    
    return retryableCodes.includes(error.code) || 
           retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
  }

  /**
   * Handle and categorize AI errors with better context
   */
  handleAIError(error) {
    if (error.name === 'AIServiceError' || error.name === 'AIResponseError') {
      return error;
    }
    
    if (error.name === 'CircuitBreakerError') {
      return new AIServiceError('AI service temporarily unavailable due to repeated failures');
    }
    
    if (error.code === 'insufficient_quota') {
      return new AIServiceError('AI service quota exceeded');
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return new AIServiceError('AI service rate limit exceeded');
    }
    
    if (error.code === 'model_not_found') {
      return new AIServiceError('AI model not available');
    }
    
    if (error.code === 'invalid_api_key') {
      return new AIServiceError('AI service authentication failed');
    }

    if (error.code === 'context_length_exceeded') {
      return new AIServiceError('Request too large for AI model');
    }
    
    return new AIServiceError('AI service temporarily unavailable');
  }

  /**
   * Generate fallback response if AI fails
   */
  generateFallbackResponse(input, requestId) {
    logger.warn(`[${requestId}] Using fallback response due to AI failure`);
    
    return {
      success: true,
      data: {
        metadata: {
          name: `Feature: ${input.description}`,
          description: `Specifica tecnica per: ${input.description}`,
          complexity: input.complexity,
          estimatedHours: input.complexity === 'simple' ? 8 : input.complexity === 'medium' ? 16 : 32,
          tags: ['web', 'api', 'react'],
          version: '1.0.0'
        },
        requirements: {
          functional: [
            {
              id: 'FR001',
              title: 'Implementazione base',
              description: `Implementare ${input.description}`,
              priority: 'high',
              category: 'core',
              dependencies: []
            }
          ]
        },
        architecture: {
          apiEndpoints: [
            {
              method: 'POST',
              path: '/api/feature',
              description: `Endpoint per ${input.description}`,
              relatedRequirements: ['FR001']
            }
          ]
        },
        implementation: {
          components: [
            {
              name: 'FeatureComponent',
              type: 'React Component',
              description: `Componente per ${input.description}`,
              relatedRequirements: ['FR001']
            }
          ]
        },
        testing: {
          testCases: [
            {
              id: 'TC001',
              title: 'Test base',
              description: `Test per ${input.description}`,
              relatedRequirements: ['FR001']
            }
          ]
        },
        deployment: {
          requirements: [
            {
              category: 'infrastructure',
              description: 'Server web standard',
              priority: 'high'
            }
          ]
        }
      },
      _metadata: {
        requestId,
        processingTime: 0,
        model: 'fallback',
        tokensUsed: 0,
        fallback: true
      }
    };
  }

  /**
   * Clean markdown code blocks from AI response
   */
  cleanMarkdownResponse(response) {
    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    let cleaned = response.trim();
    
    // Remove opening code block
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
    
    // Remove closing code block
    cleaned = cleaned.replace(/\n?\s*```\s*$/i, '');
    
    // Remove any remaining markdown formatting
    cleaned = cleaned.replace(/^\s*```\s*$/gm, '');
    
    // Remove any text before the first {
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace >= 0 && lastBrace < cleaned.length - 1) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }
    
    return cleaned.trim();
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service health status including circuit breaker state
   */
  async getHealthStatus() {
    const circuitBreakerStatus = this.circuitBreaker.getStatus();
    
    try {
      // Simple test request to check API availability (only if circuit is closed)
      if (circuitBreakerStatus.state === 'CLOSED') {
        await this.openai.chat.completions.create({
          model: config.openai.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        });
        
        return {
          status: 'healthy',
          model: config.openai.model,
          available: true,
          circuitBreaker: circuitBreakerStatus
        };
      } else {
        return {
          status: 'degraded',
          model: config.openai.model,
          available: false,
          reason: `Circuit breaker is ${circuitBreakerStatus.state}`,
          circuitBreaker: circuitBreakerStatus
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        model: config.openai.model,
        available: false,
        error: error.message,
        circuitBreaker: circuitBreakerStatus
      };
    }
  }

  /**
   * Get AI service statistics
   */
  getStatistics() {
    return {
      circuitBreaker: this.circuitBreaker.getStatus(),
      configuration: {
        model: config.openai.model,
        maxTokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
        timeout: config.openai.timeout,
        maxRetries: this.retryAttempts
      }
    };
  }

  /**
   * Reset circuit breaker (for admin operations)
   */
  resetCircuitBreaker() {
    this.circuitBreaker.reset();
    logger.info('AI service circuit breaker reset');
  }
}

// Custom error classes
class AIServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AIServiceError';
  }
}

class AIResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AIResponseError';
  }
}

const aiService = new AIService();

module.exports = {
  aiService,
  AIService,
  AIServiceError,
  AIResponseError
};