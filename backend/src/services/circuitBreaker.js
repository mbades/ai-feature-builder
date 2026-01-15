const logger = require('../utils/logger');

/**
 * Circuit Breaker implementation for external service calls
 * Prevents cascading failures and provides fallback mechanisms
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'CircuitBreaker';
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    this.expectedErrors = options.expectedErrors || [];
    
    // Circuit states
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      circuitOpenCount: 0
    };
    
    // Monitoring
    this.startMonitoring();
  }

  /**
   * Execute a function with circuit breaker protection
   * @param {Function} fn - Function to execute
   * @param {Array} args - Arguments to pass to the function
   * @returns {Promise} - Result of the function or fallback
   */
  async execute(fn, ...args) {
    this.stats.totalRequests++;
    
    // Check circuit state
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        logger.warn(`Circuit breaker ${this.name} is OPEN`, {
          failureCount: this.failureCount,
          nextAttempt: new Date(this.nextAttempt).toISOString()
        });
        throw new CircuitBreakerError('Circuit breaker is OPEN', 'CIRCUIT_OPEN');
      } else {
        // Try to recover
        this.state = 'HALF_OPEN';
        logger.info(`Circuit breaker ${this.name} entering HALF_OPEN state`);
      }
    }

    try {
      const result = await fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  onSuccess() {
    this.stats.successfulRequests++;
    
    if (this.state === 'HALF_OPEN') {
      logger.info(`Circuit breaker ${this.name} recovered, closing circuit`);
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.lastFailureTime = null;
      this.nextAttempt = null;
    }
  }

  /**
   * Handle failed execution
   * @param {Error} error - The error that occurred
   */
  onFailure(error) {
    this.stats.failedRequests++;
    
    // Check if this is an expected error that shouldn't trigger circuit breaker
    if (this.isExpectedError(error)) {
      logger.debug(`Circuit breaker ${this.name} ignoring expected error`, {
        error: error.message,
        type: error.constructor.name
      });
      return;
    }

    this.failureCount++;
    this.lastFailureTime = Date.now();

    logger.warn(`Circuit breaker ${this.name} recorded failure`, {
      failureCount: this.failureCount,
      threshold: this.failureThreshold,
      error: error.message
    });

    // Check if we should open the circuit
    if (this.failureCount >= this.failureThreshold) {
      this.openCircuit();
    }
  }

  /**
   * Open the circuit breaker
   */
  openCircuit() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.recoveryTimeout;
    this.stats.circuitOpenCount++;
    
    logger.error(`Circuit breaker ${this.name} OPENED`, {
      failureCount: this.failureCount,
      recoveryTimeout: this.recoveryTimeout,
      nextAttempt: new Date(this.nextAttempt).toISOString()
    });
  }

  /**
   * Check if error is expected and shouldn't trigger circuit breaker
   * @param {Error} error - Error to check
   * @returns {boolean} - True if error is expected
   */
  isExpectedError(error) {
    return this.expectedErrors.some(expectedError => {
      if (typeof expectedError === 'string') {
        return error.message.includes(expectedError);
      }
      if (expectedError instanceof RegExp) {
        return expectedError.test(error.message);
      }
      if (typeof expectedError === 'function') {
        return error instanceof expectedError;
      }
      return false;
    });
  }

  /**
   * Get current circuit breaker status
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      nextAttempt: this.nextAttempt ? new Date(this.nextAttempt).toISOString() : null,
      stats: { ...this.stats }
    };
  }

  /**
   * Reset circuit breaker to initial state
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = null;
    
    logger.info(`Circuit breaker ${this.name} reset`);
  }

  /**
   * Start monitoring and periodic reporting
   */
  startMonitoring() {
    setInterval(() => {
      const status = this.getStatus();
      
      if (status.stats.totalRequests > 0) {
        const successRate = (status.stats.successfulRequests / status.stats.totalRequests * 100).toFixed(2);
        
        logger.debug(`Circuit breaker ${this.name} stats`, {
          state: status.state,
          successRate: `${successRate}%`,
          totalRequests: status.stats.totalRequests,
          failureCount: status.failureCount
        });
      }
    }, this.monitoringPeriod);
  }

  /**
   * Create a wrapped version of a function with circuit breaker protection
   * @param {Function} fn - Function to wrap
   * @param {Object} options - Circuit breaker options
   * @returns {Function} - Wrapped function
   */
  static wrap(fn, options = {}) {
    const circuitBreaker = new CircuitBreaker({
      name: options.name || fn.name || 'WrappedFunction',
      ...options
    });

    return async function(...args) {
      return circuitBreaker.execute(fn, ...args);
    };
  }
}

/**
 * Circuit Breaker Error class
 */
class CircuitBreakerError extends Error {
  constructor(message, code = 'CIRCUIT_BREAKER_ERROR') {
    super(message);
    this.name = 'CircuitBreakerError';
    this.code = code;
  }
}

/**
 * Circuit Breaker Manager for managing multiple circuit breakers
 */
class CircuitBreakerManager {
  constructor() {
    this.circuitBreakers = new Map();
  }

  /**
   * Get or create a circuit breaker
   * @param {string} name - Circuit breaker name
   * @param {Object} options - Circuit breaker options
   * @returns {CircuitBreaker} - Circuit breaker instance
   */
  getCircuitBreaker(name, options = {}) {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new CircuitBreaker({
        name,
        ...options
      }));
    }
    return this.circuitBreakers.get(name);
  }

  /**
   * Get status of all circuit breakers
   * @returns {Array} - Array of circuit breaker statuses
   */
  getAllStatuses() {
    return Array.from(this.circuitBreakers.values()).map(cb => cb.getStatus());
  }

  /**
   * Reset all circuit breakers
   */
  resetAll() {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }
    logger.info('All circuit breakers reset');
  }

  /**
   * Get aggregated statistics
   * @returns {Object} - Aggregated stats
   */
  getAggregatedStats() {
    const stats = {
      totalCircuitBreakers: this.circuitBreakers.size,
      openCircuits: 0,
      halfOpenCircuits: 0,
      closedCircuits: 0,
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0
    };

    for (const circuitBreaker of this.circuitBreakers.values()) {
      const status = circuitBreaker.getStatus();
      
      switch (status.state) {
        case 'OPEN':
          stats.openCircuits++;
          break;
        case 'HALF_OPEN':
          stats.halfOpenCircuits++;
          break;
        case 'CLOSED':
          stats.closedCircuits++;
          break;
      }
      
      stats.totalRequests += status.stats.totalRequests;
      stats.totalFailures += status.stats.failedRequests;
      stats.totalSuccesses += status.stats.successfulRequests;
    }

    return stats;
  }
}

const circuitBreakerManager = new CircuitBreakerManager();

module.exports = {
  CircuitBreaker,
  CircuitBreakerError,
  CircuitBreakerManager,
  circuitBreakerManager
};