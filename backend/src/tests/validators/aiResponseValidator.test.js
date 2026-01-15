const { AIResponseValidator, AIValidationError } = require('../../validators/aiResponseValidator');

describe('AIResponseValidator', () => {
  const validResponse = {
    metadata: {
      name: 'Test Feature',
      description: 'A test feature for validation',
      complexity: 'medium',
      estimatedHours: 24,
      tags: ['test', 'validation'],
      version: '1.0.0'
    },
    requirements: {
      functional: [{
        id: 'FR001',
        title: 'Test Requirement',
        description: 'A test functional requirement',
        priority: 'high',
        category: 'test',
        dependencies: []
      }],
      nonFunctional: [{
        id: 'NFR001',
        category: 'performance',
        requirement: 'Response time under 300ms',
        metric: '< 300ms for 95% of requests',
        priority: 'high'
      }]
    },
    architecture: {
      apiEndpoints: [{
        id: 'EP001',
        method: 'GET',
        path: '/api/test',
        description: 'Test endpoint',
        category: 'test',
        authentication: false,
        rateLimit: '100 requests/hour',
        requestBody: null,
        responseBody: { message: 'string' },
        statusCodes: [{
          code: 200,
          description: 'Success'
        }],
        relatedRequirements: ['FR001']
      }],
      dataModels: [{
        id: 'DM001',
        name: 'TestModel',
        description: 'A test data model',
        category: 'entity',
        fields: [{
          name: 'id',
          type: 'UUID',
          required: true,
          description: 'Unique identifier'
        }],
        relationships: [],
        indexes: ['id'],
        constraints: ['UNIQUE(id)']
      }],
      services: [{
        id: 'SV001',
        name: 'TestService',
        description: 'A test service',
        type: 'internal',
        methods: [{
          name: 'testMethod',
          description: 'A test method',
          parameters: ['param1: string'],
          returns: 'Promise<TestModel>'
        }]
      }]
    },
    implementation: {
      dependencies: {
        runtime: [{
          name: 'express',
          type: 'library',
          version: '^4.18.0',
          purpose: 'Web framework',
          critical: true
        }],
        development: []
      },
      configuration: [],
      security: {
        authentication: 'JWT tokens',
        authorization: 'Role-based access control',
        dataProtection: ['Input validation', 'SQL injection prevention'],
        vulnerabilities: [],
        edgeCaseHandling: {
          inputValidation: 'Validate all inputs',
          errorRecovery: 'Graceful error handling',
          dataConsistency: 'Transaction-based operations',
          concurrencyControl: 'Optimistic locking'
        }
      }
    },
    testing: {
      strategy: {
        unitTests: 'Test individual components',
        integrationTests: 'Test API endpoints',
        e2eTests: 'Test complete workflows',
        coverage: 85
      },
      testCases: [{
        id: 'TC001',
        type: 'unit',
        category: 'happy_path',
        description: 'Test successful operation',
        priority: 'high',
        steps: ['Step 1', 'Step 2'],
        expectedResult: 'Operation succeeds',
        relatedRequirements: ['FR001'],
        edgeCase: null
      }],
      acceptanceCriteria: [{
        id: 'AC001',
        scenario: 'Successful test',
        given: 'Valid input',
        when: 'Operation is performed',
        then: 'Result is returned',
        priority: 'high',
        relatedRequirements: ['FR001']
      }]
    },
    deployment: {
      environment: {
        development: 'Local environment',
        staging: 'Staging environment',
        production: 'Production environment'
      },
      infrastructure: [{
        component: 'Database',
        description: 'PostgreSQL database',
        requirements: 'PostgreSQL 14+',
        scaling: 'Read replicas'
      }],
      monitoring: [{
        metric: 'Response time',
        description: 'API response time',
        threshold: '> 500ms',
        action: 'Alert team'
      }]
    }
  };

  describe('validate', () => {
    it('should validate a correct response', () => {
      const result = AIResponseValidator.validate(validResponse, 'test-001');
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject null response', () => {
      expect(() => {
        AIResponseValidator.validate(null, 'test-002');
      }).toThrow(AIValidationError);
    });

    it('should reject non-object response', () => {
      expect(() => {
        AIResponseValidator.validate('invalid', 'test-003');
      }).toThrow(AIValidationError);
    });

    it('should reject response missing required fields', () => {
      const invalidResponse = { ...validResponse };
      delete invalidResponse.metadata;

      expect(() => {
        AIResponseValidator.validate(invalidResponse, 'test-004');
      }).toThrow(AIValidationError);
    });

    it('should reject invalid ID formats', () => {
      const invalidResponse = {
        ...validResponse,
        requirements: {
          ...validResponse.requirements,
          functional: [{
            ...validResponse.requirements.functional[0],
            id: 'INVALID_ID'
          }]
        }
      };

      expect(() => {
        AIResponseValidator.validate(invalidResponse, 'test-005');
      }).toThrow(AIValidationError);
    });

    it('should reject duplicate IDs', () => {
      const invalidResponse = {
        ...validResponse,
        requirements: {
          ...validResponse.requirements,
          functional: [
            validResponse.requirements.functional[0],
            { ...validResponse.requirements.functional[0] } // Duplicate
          ]
        }
      };

      expect(() => {
        AIResponseValidator.validate(invalidResponse, 'test-006');
      }).toThrow(AIValidationError);
    });

    it('should reject invalid requirement references', () => {
      const invalidResponse = {
        ...validResponse,
        architecture: {
          ...validResponse.architecture,
          apiEndpoints: [{
            ...validResponse.architecture.apiEndpoints[0],
            relatedRequirements: ['INVALID_REQ']
          }]
        }
      };

      expect(() => {
        AIResponseValidator.validate(invalidResponse, 'test-007');
      }).toThrow(AIValidationError);
    });

    it('should reject invalid complexity vs hours combination', () => {
      const invalidResponse = {
        ...validResponse,
        metadata: {
          ...validResponse.metadata,
          complexity: 'simple',
          estimatedHours: 50 // Too high for simple
        }
      };

      expect(() => {
        AIResponseValidator.validate(invalidResponse, 'test-008');
      }).toThrow(AIValidationError);
    });
  });

  describe('quickValidate', () => {
    it('should return true for valid basic structure', () => {
      const result = AIResponseValidator.quickValidate(validResponse);
      expect(result).toBe(true);
    });

    it('should return false for null', () => {
      const result = AIResponseValidator.quickValidate(null);
      expect(result).toBe(false);
    });

    it('should return false for missing required keys', () => {
      const invalidResponse = { metadata: {} };
      const result = AIResponseValidator.quickValidate(invalidResponse);
      expect(result).toBe(false);
    });
  });
});

describe('AIValidationError', () => {
  it('should create error with message and code', () => {
    const error = new AIValidationError('Test error', 'TEST_CODE');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('AIValidationError');
  });

  it('should create error with details', () => {
    const details = [{ field: 'test', message: 'Invalid' }];
    const error = new AIValidationError('Test error', 'TEST_CODE', details);
    expect(error.details).toEqual(details);
  });
});