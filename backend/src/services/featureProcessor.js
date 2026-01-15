const logger = require('../utils/logger');
const { AIResponseValidator, AIValidationError } = require('../validators/aiResponseValidator');

class FeatureProcessor {
  /**
   * Process and validate input from request
   * @param {Object} input - Raw request body
   * @returns {Object} - Processed and validated input
   */
  processInput(input) {
    const processed = {
      description: input.description?.trim(),
      language: input.language || 'it',
      template: input.template || null,
      complexity: input.complexity || 'medium',
      includeTests: input.includeTests || false
    };

    // Additional input processing
    if (processed.description) {
      // Clean up description
      processed.description = processed.description
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\w\s.,!?;:()\\-]/g, '') // Remove special characters except basic punctuation
        .trim();
    }

    return processed;
  }

  /**
   * Process and validate AI response with comprehensive validation
   * @param {Object} aiResponse - Raw AI response
   * @param {string} requestId - Request ID for logging
   * @returns {Object} - Processed and validated specification
   */
  processAIResponse(aiResponse, requestId = 'unknown') {
    const startTime = Date.now();
    
    try {
      logger.info(`[${requestId}] Starting AI response processing`, {
        responseType: typeof aiResponse,
        hasMetadata: !!aiResponse?._metadata
      });

      // Step 1: Validate AI response structure and content
      const validationResult = AIResponseValidator.validate(aiResponse, requestId);
      
      if (!validationResult.valid) {
        throw new AIValidationError('AI response validation failed');
      }

      const validatedResponse = validationResult.data;

      // Step 2: Post-process and enhance the validated response
      const processed = this.enhanceValidatedResponse(validatedResponse, requestId);

      // Step 3: Final consistency checks
      this.performFinalChecks(processed, requestId);

      const processingTime = Date.now() - startTime;

      logger.info(`[${requestId}] AI response processing completed`, {
        processingTime,
        validationTime: validationResult.validationTime,
        featureName: processed.metadata?.name,
        requirementsCount: processed.requirements?.functional?.length || 0,
        endpointsCount: processed.architecture?.apiEndpoints?.length || 0,
        testCasesCount: processed.testing?.testCases?.length || 0
      });

      return processed;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      if (error instanceof AIValidationError) {
        logger.error(`[${requestId}] AI response validation failed`, {
          error: error.message,
          code: error.code,
          processingTime,
          detailsCount: error.details?.length || 0,
          responseKeys: Object.keys(aiResponse || {})
        });
        
        // Re-throw with more context
        const enhancedError = new Error('AI returned invalid specification');
        enhancedError.name = 'AIResponseError';
        enhancedError.originalError = error;
        enhancedError.validationDetails = error.details;
        throw enhancedError;
      }

      logger.error(`[${requestId}] Failed to process AI response`, {
        error: error.message,
        stack: error.stack,
        processingTime,
        responseType: typeof aiResponse
      });
      
      const processingError = new Error('Failed to process AI response');
      processingError.name = 'AIResponseError';
      processingError.originalError = error;
      throw processingError;
    }
  }

  /**
   * Enhance validated response with additional processing
   * @param {Object} validatedResponse - Validated AI response
   * @param {string} requestId - Request ID for logging
   * @returns {Object} - Enhanced response
   */
  enhanceValidatedResponse(validatedResponse, requestId) {
    const enhanced = {
      ...validatedResponse,
      metadata: {
        ...validatedResponse.metadata,
        processedAt: new Date().toISOString(),
        processingVersion: '2.0.0'
      }
    };

    // Enhance requirements with additional metadata
    enhanced.requirements = this.enhanceRequirements(enhanced.requirements);

    // Enhance architecture with computed fields
    enhanced.architecture = this.enhanceArchitecture(enhanced.architecture);

    // Enhance testing with coverage analysis
    enhanced.testing = this.enhanceTesting(enhanced.testing, enhanced.requirements);

    logger.debug(`[${requestId}] Response enhancement completed`, {
      enhancedFields: ['requirements', 'architecture', 'testing']
    });

    return enhanced;
  }

  /**
   * Enhance requirements section
   * @param {Object} requirements - Requirements object
   * @returns {Object} - Enhanced requirements
   */
  enhanceRequirements(requirements) {
    const enhanced = { ...requirements };

    // Add requirement statistics
    enhanced.statistics = {
      functionalCount: enhanced.functional.length,
      nonFunctionalCount: enhanced.nonFunctional.length,
      highPriorityCount: [
        ...enhanced.functional.filter(r => r.priority === 'high'),
        ...enhanced.nonFunctional.filter(r => r.priority === 'high')
      ].length,
      categoriesCount: new Set([
        ...enhanced.functional.map(r => r.category),
        ...enhanced.nonFunctional.map(r => r.category)
      ]).size
    };

    // Add dependency graph for functional requirements
    enhanced.dependencyGraph = this.buildDependencyGraph(enhanced.functional);

    return enhanced;
  }

  /**
   * Enhance architecture section
   * @param {Object} architecture - Architecture object
   * @returns {Object} - Enhanced architecture
   */
  enhanceArchitecture(architecture) {
    const enhanced = { ...architecture };

    // Add API statistics
    enhanced.statistics = {
      endpointsCount: enhanced.apiEndpoints.length,
      methodsDistribution: this.getMethodsDistribution(enhanced.apiEndpoints),
      authenticationRequired: enhanced.apiEndpoints.filter(e => e.authentication).length,
      modelsCount: enhanced.dataModels.length,
      servicesCount: enhanced.services.length
    };

    // Add model relationships map
    enhanced.relationshipsMap = this.buildRelationshipsMap(enhanced.dataModels);

    return enhanced;
  }

  /**
   * Enhance testing section
   * @param {Object} testing - Testing object
   * @param {Object} requirements - Requirements for coverage analysis
   * @returns {Object} - Enhanced testing
   */
  enhanceTesting(testing, requirements) {
    const enhanced = { ...testing };

    // Add test statistics
    enhanced.statistics = {
      testCasesCount: enhanced.testCases.length,
      acceptanceCriteriaCount: enhanced.acceptanceCriteria.length,
      testTypeDistribution: this.getTestTypeDistribution(enhanced.testCases),
      priorityDistribution: this.getTestPriorityDistribution(enhanced.testCases),
      edgeCasesCount: enhanced.testCases.filter(t => t.edgeCase).length
    };

    // Calculate requirement coverage
    enhanced.requirementCoverage = this.calculateRequirementCoverage(
      enhanced.testCases,
      enhanced.acceptanceCriteria,
      requirements
    );

    return enhanced;
  }

  /**
   * Perform final consistency checks
   * @param {Object} processed - Processed response
   * @param {string} requestId - Request ID for logging
   */
  performFinalChecks(processed, requestId) {
    const warnings = [];

    // Check if all high-priority requirements have test coverage
    const highPriorityReqs = processed.requirements.functional
      .filter(r => r.priority === 'high')
      .map(r => r.id);

    const testedRequirements = new Set([
      ...processed.testing.testCases.flatMap(t => t.relatedRequirements),
      ...processed.testing.acceptanceCriteria.flatMap(a => a.relatedRequirements)
    ]);

    const untestedHighPriority = highPriorityReqs.filter(id => !testedRequirements.has(id));
    if (untestedHighPriority.length > 0) {
      warnings.push(`High-priority requirements without tests: ${untestedHighPriority.join(', ')}`);
    }

    // Check if all API endpoints have related requirements
    const endpointsWithoutRequirements = processed.architecture.apiEndpoints
      .filter(e => e.relatedRequirements.length === 0)
      .map(e => e.id);

    if (endpointsWithoutRequirements.length > 0) {
      warnings.push(`API endpoints without related requirements: ${endpointsWithoutRequirements.join(', ')}`);
    }

    if (warnings.length > 0) {
      logger.warn(`[${requestId}] Final consistency check warnings`, {
        warningCount: warnings.length,
        warnings
      });
    }
  }

  /**
   * Build dependency graph for functional requirements
   * @param {Array} functionalRequirements - Functional requirements
   * @returns {Object} - Dependency graph
   */
  buildDependencyGraph(functionalRequirements) {
    const graph = {};
    
    functionalRequirements.forEach(req => {
      graph[req.id] = {
        dependencies: req.dependencies || [],
        dependents: []
      };
    });

    // Build dependents list
    functionalRequirements.forEach(req => {
      (req.dependencies || []).forEach(depId => {
        if (graph[depId]) {
          graph[depId].dependents.push(req.id);
        }
      });
    });

    return graph;
  }

  /**
   * Get HTTP methods distribution
   * @param {Array} endpoints - API endpoints
   * @returns {Object} - Methods distribution
   */
  getMethodsDistribution(endpoints) {
    const distribution = {};
    endpoints.forEach(endpoint => {
      distribution[endpoint.method] = (distribution[endpoint.method] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Build relationships map for data models
   * @param {Array} dataModels - Data models
   * @returns {Object} - Relationships map
   */
  buildRelationshipsMap(dataModels) {
    const map = {};
    
    dataModels.forEach(model => {
      map[model.name] = {
        outgoing: model.relationships || [],
        incoming: []
      };
    });

    // Build incoming relationships
    dataModels.forEach(model => {
      (model.relationships || []).forEach(rel => {
        if (map[rel.target]) {
          map[rel.target].incoming.push({
            from: model.name,
            type: rel.type,
            description: rel.description
          });
        }
      });
    });

    return map;
  }

  /**
   * Get test type distribution
   * @param {Array} testCases - Test cases
   * @returns {Object} - Test type distribution
   */
  getTestTypeDistribution(testCases) {
    const distribution = {};
    testCases.forEach(testCase => {
      distribution[testCase.type] = (distribution[testCase.type] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Get test priority distribution
   * @param {Array} testCases - Test cases
   * @returns {Object} - Test priority distribution
   */
  getTestPriorityDistribution(testCases) {
    const distribution = {};
    testCases.forEach(testCase => {
      distribution[testCase.priority] = (distribution[testCase.priority] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Calculate requirement coverage by tests
   * @param {Array} testCases - Test cases
   * @param {Array} acceptanceCriteria - Acceptance criteria
   * @param {Object} requirements - All requirements
   * @returns {Object} - Coverage analysis
   */
  calculateRequirementCoverage(testCases, acceptanceCriteria, requirements) {
    const allRequirementIds = new Set([
      ...requirements.functional.map(r => r.id),
      ...requirements.nonFunctional.map(r => r.id)
    ]);

    const coveredByTests = new Set(testCases.flatMap(t => t.relatedRequirements));
    const coveredByCriteria = new Set(acceptanceCriteria.flatMap(a => a.relatedRequirements));
    const allCovered = new Set([...coveredByTests, ...coveredByCriteria]);

    const uncovered = [...allRequirementIds].filter(id => !allCovered.has(id));

    return {
      total: allRequirementIds.size,
      covered: allCovered.size,
      uncovered: uncovered.length,
      coveragePercentage: allRequirementIds.size > 0 
        ? Math.round((allCovered.size / allRequirementIds.size) * 100)
        : 0,
      uncoveredRequirements: uncovered,
      testCoverage: coveredByTests.size,
      criteriaCoverage: coveredByCriteria.size
    };
  }
}

const featureProcessor = new FeatureProcessor();

module.exports = {
  featureProcessor,
  FeatureProcessor
};