const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Comprehensive AI response validation
 * Ensures the AI output matches the expected schema exactly
 */

// Field validation schema
const fieldSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  required: Joi.boolean().required(),
  description: Joi.string().required(),
  validation: Joi.string().optional(),
  defaultValue: Joi.any().optional()
});

// Relationship validation schema
const relationshipSchema = Joi.object({
  type: Joi.string().valid('oneToOne', 'oneToMany', 'manyToMany').required(),
  target: Joi.string().required(),
  description: Joi.string().required(),
  foreignKey: Joi.string().optional()
});

// Status code validation schema
const statusCodeSchema = Joi.object({
  code: Joi.number().integer().min(100).max(599).required(),
  description: Joi.string().required(),
  errorHandling: Joi.string().optional(),
  retryStrategy: Joi.string().valid('none', 'immediate', 'exponential_backoff').optional()
});

// Functional requirement validation schema
const functionalRequirementSchema = Joi.object({
  id: Joi.string().pattern(/^FR\d{3}$/).required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  priority: Joi.string().valid('high', 'medium', 'low').required(),
  category: Joi.string().required(),
  dependencies: Joi.array().items(Joi.string().pattern(/^FR\d{3}$/)).default([])
});

// Non-functional requirement validation schema
const nonFunctionalRequirementSchema = Joi.object({
  id: Joi.string().pattern(/^NFR\d{3}$/).required(),
  category: Joi.string().valid('performance', 'security', 'usability', 'reliability', 'scalability', 'maintainability').required(),
  requirement: Joi.string().required(),
  metric: Joi.string().required(),
  priority: Joi.string().valid('high', 'medium', 'low').required()
});

// API endpoint validation schema
const apiEndpointSchema = Joi.object({
  id: Joi.string().pattern(/^EP\d{3}$/).required(),
  method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
  path: Joi.string().pattern(/^\/api\//).required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  authentication: Joi.boolean().required(),
  rateLimit: Joi.string().required(),
  requestBody: Joi.alternatives().try(Joi.object(), Joi.valid(null)).required(),
  responseBody: Joi.object().required(),
  statusCodes: Joi.array().items(statusCodeSchema).min(1).required(),
  relatedRequirements: Joi.array().items(Joi.string().pattern(/^(FR|NFR)\d{3}$/)).default([])
});

// Data model validation schema
const dataModelSchema = Joi.object({
  id: Joi.string().pattern(/^DM\d{3}$/).required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  fields: Joi.array().items(fieldSchema).min(1).required(),
  relationships: Joi.array().items(relationshipSchema).default([]),
  indexes: Joi.array().items(Joi.string()).default([]),
  constraints: Joi.array().items(Joi.string()).default([])
});

// Service validation schema
const serviceSchema = Joi.object({
  id: Joi.string().pattern(/^SV\d{3}$/).required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('internal', 'external', 'database', 'cache', 'queue').required(),
  methods: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    parameters: Joi.array().items(Joi.string()).default([]),
    returns: Joi.string().required()
  })).default([])
});

// Dependency validation schema
const dependencySchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('library', 'service', 'database', 'external_api').required(),
  version: Joi.string().required(),
  purpose: Joi.string().required(),
  critical: Joi.boolean().required()
});

// Test case validation schema
const testCaseSchema = Joi.object({
  id: Joi.string().pattern(/^TC\d{3}$/).required(),
  type: Joi.string().valid('unit', 'integration', 'e2e', 'performance', 'security', 'edge_case').required(),
  category: Joi.string().valid('happy_path', 'edge_case', 'error_handling', 'boundary_test', 'security_test').required(),
  description: Joi.string().required(),
  priority: Joi.string().valid('high', 'medium', 'low').required(),
  steps: Joi.array().items(Joi.string()).min(1).required(),
  expectedResult: Joi.string().required(),
  relatedRequirements: Joi.array().items(Joi.string().pattern(/^(FR|NFR)\d{3}$/)).default([]),
  edgeCase: Joi.alternatives().try(
    Joi.object({
      scenario: Joi.string().required(),
      triggerCondition: Joi.string().required(),
      expectedBehavior: Joi.string().required(),
      recoveryAction: Joi.string().required()
    }),
    Joi.valid(null)
  ).optional()
});

// Acceptance criteria validation schema
const acceptanceCriteriaSchema = Joi.object({
  id: Joi.string().pattern(/^AC\d{3}$/).required(),
  scenario: Joi.string().required(),
  given: Joi.string().required(),
  when: Joi.string().required(),
  then: Joi.string().required(),
  priority: Joi.string().valid('high', 'medium', 'low').required(),
  relatedRequirements: Joi.array().items(Joi.string().pattern(/^(FR|NFR)\d{3}$/)).default([])
});

// Main AI response validation schema
const aiResponseSchema = Joi.object({
  metadata: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    complexity: Joi.string().valid('simple', 'medium', 'complex').required(),
    estimatedHours: Joi.number().integer().min(1).max(1000).required(),
    tags: Joi.array().items(Joi.string()).min(1).required(),
    version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required()
  }).required(),

  requirements: Joi.object({
    functional: Joi.array().items(functionalRequirementSchema).min(1).required(),
    nonFunctional: Joi.array().items(nonFunctionalRequirementSchema).min(1).required()
  }).required(),

  architecture: Joi.object({
    apiEndpoints: Joi.array().items(apiEndpointSchema).min(1).required(),
    dataModels: Joi.array().items(dataModelSchema).min(1).required(),
    services: Joi.array().items(serviceSchema).min(1).required()
  }).required(),

  implementation: Joi.object({
    dependencies: Joi.object({
      runtime: Joi.array().items(dependencySchema).min(1).required(),
      development: Joi.array().items(dependencySchema).default([])
    }).required(),
    configuration: Joi.array().items(Joi.object({
      key: Joi.string().required(),
      description: Joi.string().required(),
      type: Joi.string().valid('string', 'number', 'boolean', 'object').required(),
      required: Joi.boolean().required(),
      defaultValue: Joi.any().optional(),
      environment: Joi.string().required()
    })).default([]),
    security: Joi.object({
      authentication: Joi.string().required(),
      authorization: Joi.string().required(),
      dataProtection: Joi.array().items(Joi.string()).min(1).required(),
      vulnerabilities: Joi.array().items(Joi.string()).default([]),
      edgeCaseHandling: Joi.object({
        inputValidation: Joi.string().required(),
        errorRecovery: Joi.string().required(),
        dataConsistency: Joi.string().required(),
        concurrencyControl: Joi.string().required()
      }).required()
    }).required()
  }).required(),

  testing: Joi.object({
    strategy: Joi.object({
      unitTests: Joi.string().required(),
      integrationTests: Joi.string().required(),
      e2eTests: Joi.string().required(),
      coverage: Joi.number().min(0).max(100).required()
    }).required(),
    testCases: Joi.array().items(testCaseSchema).min(1).required(),
    acceptanceCriteria: Joi.array().items(acceptanceCriteriaSchema).min(1).required()
  }).required(),

  deployment: Joi.object({
    environment: Joi.object({
      development: Joi.string().required(),
      staging: Joi.string().required(),
      production: Joi.string().required()
    }).required(),
    infrastructure: Joi.array().items(Joi.object({
      component: Joi.string().required(),
      description: Joi.string().required(),
      requirements: Joi.string().required(),
      scaling: Joi.string().required()
    })).min(1).required(),
    monitoring: Joi.array().items(Joi.object({
      metric: Joi.string().required(),
      description: Joi.string().required(),
      threshold: Joi.string().required(),
      action: Joi.string().required()
    })).min(1).required()
  }).required(),

  // Allow metadata from AI service but don't validate it
  _metadata: Joi.object().optional()
});

/**
 * AI Response Validator Class
 */
class AIResponseValidator {
  /**
   * Validate complete AI response
   * @param {Object} response - AI response to validate
   * @param {string} requestId - Request ID for logging
   * @returns {Object} - Validation result
   */
  static validate(response, requestId) {
    const startTime = Date.now();
    
    try {
      // First check if response is an object
      if (!response || typeof response !== 'object') {
        throw new AIValidationError('Response must be a valid object', 'INVALID_TYPE');
      }

      // Validate against schema
      const { error, value } = aiResponseSchema.validate(response, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });

      if (error) {
        const validationErrors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
          type: detail.type
        }));

        logger.error(`[${requestId}] AI response validation failed`, {
          errorCount: validationErrors.length,
          errors: validationErrors.slice(0, 10), // Log first 10 errors
          responseKeys: Object.keys(response || {})
        });

        throw new AIValidationError('AI response validation failed', 'SCHEMA_VALIDATION', validationErrors);
      }

      // Additional business logic validation
      this.validateBusinessLogic(value, requestId);

      const validationTime = Date.now() - startTime;
      
      logger.info(`[${requestId}] AI response validation successful`, {
        validationTime,
        functionalRequirements: value.requirements.functional.length,
        apiEndpoints: value.architecture.apiEndpoints.length,
        testCases: value.testing.testCases.length
      });

      return {
        valid: true,
        data: value,
        validationTime
      };

    } catch (error) {
      const validationTime = Date.now() - startTime;
      
      if (error instanceof AIValidationError) {
        logger.error(`[${requestId}] AI validation error`, {
          error: error.message,
          code: error.code,
          validationTime,
          details: error.details?.slice(0, 5) // Log first 5 details
        });
        throw error;
      }

      logger.error(`[${requestId}] Unexpected validation error`, {
        error: error.message,
        stack: error.stack,
        validationTime
      });

      throw new AIValidationError('Unexpected validation error', 'INTERNAL_ERROR');
    }
  }

  /**
   * Validate business logic rules
   * @param {Object} response - Validated response
   * @param {string} requestId - Request ID for logging
   */
  static validateBusinessLogic(response, requestId) {
    const errors = [];

    // Check ID uniqueness across all entities
    const allIds = new Set();
    const checkIdUniqueness = (items, prefix) => {
      items.forEach(item => {
        if (allIds.has(item.id)) {
          errors.push(`Duplicate ID found: ${item.id}`);
        }
        allIds.add(item.id);
        
        if (!item.id.startsWith(prefix)) {
          errors.push(`Invalid ID format: ${item.id} should start with ${prefix}`);
        }
      });
    };

    // Validate ID formats and uniqueness
    checkIdUniqueness(response.requirements.functional, 'FR');
    checkIdUniqueness(response.requirements.nonFunctional, 'NFR');
    checkIdUniqueness(response.architecture.apiEndpoints, 'EP');
    checkIdUniqueness(response.architecture.dataModels, 'DM');
    checkIdUniqueness(response.architecture.services, 'SV');
    checkIdUniqueness(response.testing.testCases, 'TC');
    checkIdUniqueness(response.testing.acceptanceCriteria, 'AC');

    // Validate requirement references
    const validRequirementIds = new Set([
      ...response.requirements.functional.map(r => r.id),
      ...response.requirements.nonFunctional.map(r => r.id)
    ]);

    // Check API endpoint requirement references
    response.architecture.apiEndpoints.forEach(endpoint => {
      endpoint.relatedRequirements.forEach(reqId => {
        if (!validRequirementIds.has(reqId)) {
          errors.push(`API endpoint ${endpoint.id} references invalid requirement: ${reqId}`);
        }
      });
    });

    // Check test case requirement references
    response.testing.testCases.forEach(testCase => {
      testCase.relatedRequirements.forEach(reqId => {
        if (!validRequirementIds.has(reqId)) {
          errors.push(`Test case ${testCase.id} references invalid requirement: ${reqId}`);
        }
      });
    });

    // Validate functional requirement dependencies
    response.requirements.functional.forEach(req => {
      req.dependencies.forEach(depId => {
        if (!validRequirementIds.has(depId)) {
          errors.push(`Requirement ${req.id} has invalid dependency: ${depId}`);
        }
      });
    });

    // Validate data model relationships
    const validModelNames = new Set(response.architecture.dataModels.map(m => m.name));
    response.architecture.dataModels.forEach(model => {
      model.relationships.forEach(rel => {
        if (!validModelNames.has(rel.target)) {
          errors.push(`Model ${model.name} has invalid relationship target: ${rel.target}`);
        }
      });
    });

    // Check minimum requirements
    if (response.requirements.functional.length === 0) {
      errors.push('At least one functional requirement is required');
    }

    if (response.architecture.apiEndpoints.length === 0) {
      errors.push('At least one API endpoint is required');
    }

    if (response.testing.testCases.length === 0) {
      errors.push('At least one test case is required');
    }

    // Validate complexity vs estimated hours consistency
    const complexity = response.metadata.complexity;
    const hours = response.metadata.estimatedHours;
    
    if (complexity === 'simple' && hours > 16) {
      errors.push(`Simple complexity should not exceed 16 hours, got ${hours}`);
    } else if (complexity === 'medium' && (hours < 16 || hours > 40)) {
      errors.push(`Medium complexity should be 16-40 hours, got ${hours}`);
    } else if (complexity === 'complex' && hours < 40) {
      errors.push(`Complex features should be at least 40 hours, got ${hours}`);
    }

    if (errors.length > 0) {
      logger.warn(`[${requestId}] Business logic validation warnings`, {
        errorCount: errors.length,
        errors: errors.slice(0, 10)
      });
      
      throw new AIValidationError('Business logic validation failed', 'BUSINESS_LOGIC', errors);
    }
  }

  /**
   * Quick validation for basic structure
   * @param {Object} response - Response to validate
   * @returns {boolean} - True if basic structure is valid
   */
  static quickValidate(response) {
    if (!response || typeof response !== 'object') return false;
    
    const requiredKeys = ['metadata', 'requirements', 'architecture', 'implementation', 'testing', 'deployment'];
    return requiredKeys.every(key => Object.prototype.hasOwnProperty.call(response, key));
  }
}

/**
 * Custom validation error class
 */
class AIValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR', details = null) {
    super(message);
    this.name = 'AIValidationError';
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  AIResponseValidator,
  AIValidationError,
  aiResponseSchema
};