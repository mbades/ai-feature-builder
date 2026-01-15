const config = require('../config');
const logger = require('../utils/logger');

/**
 * Simple in-memory cache service with TTL support and memory leak protection
 * Can be easily replaced with Redis for production scaling
 */
class CacheService {
  constructor(namespace = 'default') {
    this.namespace = namespace;
    this.cache = new Map();
    this.timers = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Memory leak protection
    this.maxSize = config.cache.maxSize;
    this.cleanupInterval = null;
    this.startCleanupTimer();
  }

  /**
   * Start periodic cleanup to prevent memory leaks
   */
  startCleanupTimer() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);
    
    // Ensure cleanup runs on process exit
    process.on('beforeExit', () => {
      this.destroy();
    });
  }

  /**
   * Perform cleanup of expired entries and timers
   */
  performCleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    const maxCleanupTime = 100; // Max 100ms for cleanup to avoid blocking
    const startTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      // Check if we've spent too much time cleaning up
      if (Date.now() - startTime > maxCleanupTime) {
        break;
      }

      if (item.expiresAt && now > item.expiresAt) {
        this.cache.delete(key);
        
        // Clean up associated timer
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
        
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`Cache cleanup completed for ${this.namespace}`, {
        cleanedEntries: cleanedCount,
        remainingEntries: this.cache.size,
        cleanupTime: Date.now() - startTime
      });
    }

    // If cache is still too large, perform emergency cleanup
    if (this.cache.size > this.maxSize * 1.2) {
      this.emergencyCleanup();
    }
  }

  /**
   * Emergency cleanup when cache grows too large
   */
  emergencyCleanup() {
    const targetSize = Math.floor(this.maxSize * 0.8); // Clean to 80% of max size
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.createdAt - b.createdAt); // Sort by creation time

    let removedCount = 0;
    while (this.cache.size > targetSize && entries.length > 0) {
      const [key] = entries.shift();
      if (this.cache.has(key)) {
        this.cache.delete(key);
        
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
        
        removedCount++;
      }
    }

    logger.warn(`Emergency cache cleanup performed for ${this.namespace}`, {
      removedEntries: removedCount,
      currentSize: this.cache.size,
      targetSize
    });
  }

  /**
   * Get value from cache
   */
  get(key) {
    const fullKey = `${this.namespace}:${key}`;
    
    if (this.cache.has(fullKey)) {
      const item = this.cache.get(fullKey);
      
      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.delete(key);
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      return item.value;
    }
    
    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key, value, ttl = config.cache.ttl) {
    const fullKey = `${this.namespace}:${key}`;
    
    // Clear existing timer if any
    if (this.timers.has(fullKey)) {
      clearTimeout(this.timers.get(fullKey));
      this.timers.delete(fullKey);
    }
    
    const item = {
      value,
      createdAt: Date.now(),
      expiresAt: ttl > 0 ? Date.now() + (ttl * 1000) : null
    };
    
    this.cache.set(fullKey, item);
    this.stats.sets++;
    
    // Set expiration timer if TTL is specified
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);
      
      this.timers.set(fullKey, timer);
      
      // Prevent timer from keeping process alive
      timer.unref();
    }
    
    // Enforce max cache size with efficient eviction
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
    
    logger.debug(`Cache set: ${fullKey}`, { ttl, size: this.cache.size });
  }

  /**
   * Delete value from cache
   */
  delete(key) {
    const fullKey = `${this.namespace}:${key}`;
    
    if (this.cache.has(fullKey)) {
      this.cache.delete(fullKey);
      this.stats.deletes++;
      
      // Clear timer if exists
      if (this.timers.has(fullKey)) {
        clearTimeout(this.timers.get(fullKey));
        this.timers.delete(fullKey);
      }
      
      logger.debug(`Cache delete: ${fullKey}`);
      return true;
    }
    
    return false;
  }

  /**
   * Check if key exists in cache
   */
  has(key) {
    const fullKey = `${this.namespace}:${key}`;
    const exists = this.cache.has(fullKey);
    
    if (exists) {
      const item = this.cache.get(fullKey);
      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.delete(key);
        return false;
      }
    }
    
    return exists;
  }

  /**
   * Clear all cache entries for this namespace
   */
  clear() {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${this.namespace}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
    });
    
    logger.info(`Cache cleared for namespace: ${this.namespace}`, {
      deletedKeys: keysToDelete.length
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      timersCount: this.timers.size,
      namespace: this.namespace,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  getMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, item] of this.cache.entries()) {
      // Rough estimation of memory usage
      totalSize += key.length * 2; // UTF-16 encoding
      totalSize += JSON.stringify(item.value).length * 2;
      totalSize += 64; // Overhead for object structure
    }
    
    return {
      estimatedBytes: totalSize,
      estimatedMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
  }

  /**
   * Evict oldest entries when cache is full (optimized for performance)
   */
  evictOldest() {
    const namespacePrefix = `${this.namespace}:`;
    let oldestKey = null;
    let oldestTime = Date.now();
    
    // Find oldest entry efficiently
    for (const [key, item] of this.cache.entries()) {
      if (key.startsWith(namespacePrefix) && item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const key = oldestKey.replace(namespacePrefix, '');
      this.delete(key);
      
      logger.debug(`Cache evicted oldest entry: ${oldestKey}`);
    }
  }

  /**
   * Get all keys for this namespace
   */
  getKeys() {
    return Array.from(this.cache.keys())
      .filter(key => key.startsWith(`${this.namespace}:`))
      .map(key => key.replace(`${this.namespace}:`, ''));
  }

  /**
   * Get cache size for this namespace
   */
  getSize() {
    return Array.from(this.cache.keys())
      .filter(key => key.startsWith(`${this.namespace}:`))
      .length;
  }

  /**
   * Destroy cache service and clean up resources
   */
  destroy() {
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    
    // Clear cache
    this.cache.clear();
    
    logger.info(`Cache service destroyed for namespace: ${this.namespace}`);
  }
}

/**
 * Global cache manager for different namespaces
 */
class CacheManager {
  constructor() {
    this.caches = new Map();
  }

  /**
   * Get or create cache for namespace
   */
  getCache(namespace) {
    if (!this.caches.has(namespace)) {
      this.caches.set(namespace, new CacheService(namespace));
    }
    return this.caches.get(namespace);
  }

  /**
   * Clear all caches
   */
  clearAll() {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
    logger.info('All caches cleared');
  }

  /**
   * Get global cache statistics
   */
  getGlobalStats() {
    const stats = {
      totalCaches: this.caches.size,
      totalSize: 0,
      totalHits: 0,
      totalMisses: 0,
      caches: {}
    };

    for (const [namespace, cache] of this.caches.entries()) {
      const cacheStats = cache.getStats();
      stats.totalSize += cacheStats.size;
      stats.totalHits += cacheStats.hits;
      stats.totalMisses += cacheStats.misses;
      stats.caches[namespace] = cacheStats;
    }

    stats.globalHitRate = stats.totalHits / (stats.totalHits + stats.totalMisses) || 0;

    return stats;
  }
}

const cacheManager = new CacheManager();

module.exports = {
  CacheService,
  CacheManager,
  cacheManager
};