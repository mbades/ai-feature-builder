const logger = require('./logger');

/**
 * Simple metrics collection service with memory leak protection
 * Can be extended with Prometheus or other monitoring solutions
 */
class MetricsService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byEndpoint: new Map(),
        byStatusCode: new Map()
      },
      ai: {
        requests: 0,
        tokens: 0,
        errors: 0,
        avgResponseTime: 0,
        totalResponseTime: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0
      }
    };
    
    this.startTime = Date.now();
    this.maxEndpoints = 1000; // Prevent unbounded growth
    this.maxStatusCodes = 50;
    
    // Periodic cleanup to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 10 * 60 * 1000); // Every 10 minutes
    
    // Cleanup on process exit
    process.on('beforeExit', () => {
      this.destroy();
    });
  }

  /**
   * Perform cleanup to prevent unbounded growth
   */
  performCleanup() {
    // Clean up endpoint metrics if too many
    if (this.metrics.requests.byEndpoint.size > this.maxEndpoints) {
      const entries = Array.from(this.metrics.requests.byEndpoint.entries())
        .sort(([, a], [, b]) => a - b) // Sort by count, ascending
        .slice(0, Math.floor(this.maxEndpoints * 0.1)); // Remove bottom 10%
      
      entries.forEach(([endpoint]) => {
        this.metrics.requests.byEndpoint.delete(endpoint);
      });
      
      logger.info('Metrics cleanup performed', {
        endpointsRemoved: entries.length,
        remainingEndpoints: this.metrics.requests.byEndpoint.size
      });
    }

    // Clean up status code metrics if too many
    if (this.metrics.requests.byStatusCode.size > this.maxStatusCodes) {
      const entries = Array.from(this.metrics.requests.byStatusCode.entries())
        .sort(([, a], [, b]) => a - b)
        .slice(0, Math.floor(this.maxStatusCodes * 0.2)); // Remove bottom 20%
      
      entries.forEach(([statusCode]) => {
        this.metrics.requests.byStatusCode.delete(statusCode);
      });
    }
  }

  /**
   * Record HTTP request metrics with bounds checking
   */
  recordRequest(req, res, responseTime) {
    this.metrics.requests.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }

    // Track by endpoint with size limits
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    if (this.metrics.requests.byEndpoint.size < this.maxEndpoints || 
        this.metrics.requests.byEndpoint.has(endpoint)) {
      const endpointCount = this.metrics.requests.byEndpoint.get(endpoint) || 0;
      this.metrics.requests.byEndpoint.set(endpoint, endpointCount + 1);
    }

    // Track by status code with size limits
    if (this.metrics.requests.byStatusCode.size < this.maxStatusCodes || 
        this.metrics.requests.byStatusCode.has(res.statusCode)) {
      const statusCount = this.metrics.requests.byStatusCode.get(res.statusCode) || 0;
      this.metrics.requests.byStatusCode.set(res.statusCode, statusCount + 1);
    }

    logger.debug('Request metrics recorded', {
      endpoint,
      statusCode: res.statusCode,
      responseTime,
      totalRequests: this.metrics.requests.total
    });
  }

  /**
   * Record AI service metrics
   */
  recordAIRequest(responseTime, tokensUsed = 0, success = true) {
    this.metrics.ai.requests++;
    this.metrics.ai.totalResponseTime += responseTime;
    this.metrics.ai.avgResponseTime = this.metrics.ai.totalResponseTime / this.metrics.ai.requests;
    
    if (tokensUsed > 0) {
      this.metrics.ai.tokens += tokensUsed;
    }
    
    if (!success) {
      this.metrics.ai.errors++;
    }

    logger.debug('AI metrics recorded', {
      responseTime,
      tokensUsed,
      success,
      avgResponseTime: Math.round(this.metrics.ai.avgResponseTime),
      totalRequests: this.metrics.ai.requests
    });
  }

  /**
   * Record cache metrics
   */
  recordCacheOperation(operation, hit = false) {
    switch (operation) {
      case 'get':
        if (hit) {
          this.metrics.cache.hits++;
        } else {
          this.metrics.cache.misses++;
        }
        break;
      case 'set':
        this.metrics.cache.sets++;
        break;
      case 'delete':
        this.metrics.cache.deletes++;
        break;
    }
  }

  /**
   * Get all metrics with memory usage info
   */
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const uptimeSeconds = Math.floor(uptime / 1000);
    
    return {
      uptime: {
        ms: uptime,
        seconds: uptimeSeconds,
        human: this.formatUptime(uptimeSeconds)
      },
      requests: {
        ...this.metrics.requests,
        byEndpoint: Object.fromEntries(this.metrics.requests.byEndpoint),
        byStatusCode: Object.fromEntries(this.metrics.requests.byStatusCode),
        successRate: this.metrics.requests.total > 0 
          ? (this.metrics.requests.success / this.metrics.requests.total * 100).toFixed(2) + '%'
          : '0%',
        errorRate: this.metrics.requests.total > 0
          ? (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2) + '%'
          : '0%'
      },
      ai: {
        ...this.metrics.ai,
        avgResponseTime: Math.round(this.metrics.ai.avgResponseTime),
        successRate: this.metrics.ai.requests > 0
          ? (((this.metrics.ai.requests - this.metrics.ai.errors) / this.metrics.ai.requests) * 100).toFixed(2) + '%'
          : '0%',
        avgTokensPerRequest: this.metrics.ai.requests > 0
          ? Math.round(this.metrics.ai.tokens / this.metrics.ai.requests)
          : 0
      },
      cache: {
        ...this.metrics.cache,
        hitRate: (this.metrics.cache.hits + this.metrics.cache.misses) > 0
          ? (this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses) * 100).toFixed(2) + '%'
          : '0%'
      },
      memory: {
        endpointMapSize: this.metrics.requests.byEndpoint.size,
        statusCodeMapSize: this.metrics.requests.byStatusCode.size,
        maxEndpoints: this.maxEndpoints,
        maxStatusCodes: this.maxStatusCodes
      }
    };
  }

  /**
   * Format uptime in human readable format
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byEndpoint: new Map(),
        byStatusCode: new Map()
      },
      ai: {
        requests: 0,
        tokens: 0,
        errors: 0,
        avgResponseTime: 0,
        totalResponseTime: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0
      }
    };
    
    this.startTime = Date.now();
    logger.info('Metrics reset');
  }

  /**
   * Get summary for logging
   */
  getSummary() {
    const metrics = this.getMetrics();
    return {
      uptime: metrics.uptime.human,
      requests: metrics.requests.total,
      successRate: metrics.requests.successRate,
      aiRequests: metrics.ai.requests,
      aiAvgTime: metrics.ai.avgResponseTime,
      cacheHitRate: metrics.cache.hitRate,
      memoryUsage: {
        endpoints: metrics.memory.endpointMapSize,
        statusCodes: metrics.memory.statusCodeMapSize
      }
    };
  }

  /**
   * Destroy metrics service and clean up resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    logger.info('Metrics service destroyed');
  }
}

const metricsService = new MetricsService();

// Log metrics summary every 5 minutes in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    logger.info('Metrics Summary', metricsService.getSummary());
  }, 5 * 60 * 1000);
}

module.exports = {
  metricsService,
  MetricsService
};