const logger = require('./logger');

/**
 * Advanced input sanitization utility
 * Protects against various injection attacks and malicious input
 */
class InputSanitizer {
  constructor() {
    // Comprehensive patterns for malicious content detection
    this.maliciousPatterns = [
      // Script injection patterns
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      
      // Protocol injection
      /javascript\s*:/gi,
      /vbscript\s*:/gi,
      /data\s*:\s*text\s*\/\s*html/gi,
      /data\s*:\s*application\s*\/\s*javascript/gi,
      
      // Event handlers
      /on\w+\s*=/gi,
      
      // Function calls that can execute code
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(\s*['"`]/gi,
      /setInterval\s*\(\s*['"`]/gi,
      
      // SQL injection patterns
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(--|\/\*|\*\/|;)/g,
      
      // Path traversal
      /\.\.\//g,
      /\.\.\\/g,
      
      // Command injection
      /[;&|`$(){}[\]]/g
    ];

    // Encoding attack patterns
    this.encodingPatterns = [
      // URL encoding variations
      /%3C%73%63%72%69%70%74/gi, // <script
      /%6A%61%76%61%73%63%72%69%70%74/gi, // javascript
      
      // HTML entity encoding
      /&lt;script/gi,
      /&#x3C;script/gi,
      /&#60;script/gi,
      
      // Unicode encoding
      /\\u003c\\u0073\\u0063\\u0072\\u0069\\u0070\\u0074/gi,
      
      // Double encoding
      /%253C%2573%2563%2572%2569%2570%2574/gi
    ];
  }

  /**
   * Sanitize string input with comprehensive protection
   * @param {string} input - Input string to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized string
   */
  sanitizeString(input, options = {}) {
    if (typeof input !== 'string') {
      return input;
    }

    const {
      allowHtml = false,
      maxLength = 10000,
      preserveNewlines = true,
      logSuspicious = true
    } = options;

    let sanitized = input;
    const originalLength = input.length;
    const suspiciousPatterns = [];

    // Check for suspicious patterns before sanitization
    this.maliciousPatterns.forEach((pattern, index) => {
      if (pattern.test(sanitized)) {
        suspiciousPatterns.push(`malicious_pattern_${index}`);
      }
    });

    this.encodingPatterns.forEach((pattern, index) => {
      if (pattern.test(sanitized)) {
        suspiciousPatterns.push(`encoding_pattern_${index}`);
      }
    });

    // Log suspicious content
    if (suspiciousPatterns.length > 0 && logSuspicious) {
      logger.warn('Suspicious input detected and sanitized', {
        patterns: suspiciousPatterns,
        inputLength: originalLength,
        inputPreview: input.substring(0, 100) + '...'
      });
    }

    // Decode common encoding attacks first
    sanitized = this.decodeEncodingAttacks(sanitized);

    // Remove malicious patterns
    this.maliciousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Additional HTML sanitization if not allowing HTML
    if (!allowHtml) {
      sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Normalize whitespace
    if (!preserveNewlines) {
      sanitized = sanitized.replace(/\s+/g, ' ');
    }

    // Enforce length limits
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      logger.warn('Input truncated due to length limit', {
        originalLength,
        maxLength,
        truncated: true
      });
    }

    // Final cleanup
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Decode various encoding attacks
   * @param {string} input - Input to decode
   * @returns {string} - Decoded input
   */
  decodeEncodingAttacks(input) {
    let decoded = input;

    try {
      // URL decode (multiple passes to catch double encoding)
      for (let i = 0; i < 3; i++) {
        const previous = decoded;
        decoded = decodeURIComponent(decoded);
        if (decoded === previous) break; // No more changes
      }
    } catch (error) {
      // Invalid URL encoding, keep original
      decoded = input;
    }

    // HTML entity decode
    decoded = decoded
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&amp;/g, '&'); // This should be last

    // Unicode decode
    decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });

    return decoded;
  }

  /**
   * Sanitize object recursively
   * @param {Object} obj - Object to sanitize
   * @param {Object} options - Sanitization options
   * @returns {Object} - Sanitized object
   */
  sanitizeObject(obj, options = {}) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj, options);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, options));
    }

    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key, { ...options, allowHtml: false });
        sanitized[sanitizedKey] = this.sanitizeObject(value, options);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Validate and sanitize email addresses
   * @param {string} email - Email to validate
   * @returns {Object} - Validation result
   */
  validateEmail(email) {
    if (typeof email !== 'string') {
      return { valid: false, error: 'Email must be a string' };
    }

    // Basic email regex (RFC 5322 compliant)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    const sanitized = this.sanitizeString(email, { allowHtml: false, maxLength: 254 });

    if (!emailRegex.test(sanitized)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true, email: sanitized };
  }

  /**
   * Validate URL and prevent malicious redirects
   * @param {string} url - URL to validate
   * @param {Array} allowedDomains - Allowed domains (optional)
   * @returns {Object} - Validation result
   */
  validateUrl(url, allowedDomains = []) {
    if (typeof url !== 'string') {
      return { valid: false, error: 'URL must be a string' };
    }

    const sanitized = this.sanitizeString(url, { allowHtml: false });

    try {
      const urlObj = new URL(sanitized);

      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
      }

      // Check against allowed domains if specified
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => 
          urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
        );

        if (!isAllowed) {
          return { valid: false, error: 'Domain not allowed' };
        }
      }

      // Prevent localhost and private IP access in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = urlObj.hostname.toLowerCase();
        const privatePatterns = [
          /^localhost$/,
          /^127\./,
          /^10\./,
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
          /^192\.168\./,
          /^::1$/,
          /^fc00:/,
          /^fe80:/
        ];

        if (privatePatterns.some(pattern => pattern.test(hostname))) {
          return { valid: false, error: 'Private network access not allowed' };
        }
      }

      return { valid: true, url: sanitized };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Rate limit check for sanitization operations
   * @param {string} identifier - Unique identifier (IP, user ID, etc.)
   * @returns {boolean} - Whether operation is allowed
   */
  checkRateLimit(identifier) {
    // Simple in-memory rate limiting for sanitization operations
    // In production, use Redis or similar
    if (!this.rateLimitMap) {
      this.rateLimitMap = new Map();
    }

    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxOperations = 1000; // Max 1000 sanitization operations per minute

    const key = `sanitize_${identifier}`;
    const record = this.rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }

    this.rateLimitMap.set(key, record);

    if (record.count > maxOperations) {
      logger.warn('Sanitization rate limit exceeded', {
        identifier,
        count: record.count,
        maxOperations
      });
      return false;
    }

    return true;
  }
}

const inputSanitizer = new InputSanitizer();

module.exports = {
  inputSanitizer,
  InputSanitizer
};