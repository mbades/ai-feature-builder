import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  validateDescription,
  validateFeatureRequest,
  sanitizeJsonForDisplay,
  generateCacheKey,
  validateStorageData
} from '../validation'

describe('validation utils', () => {
  describe('sanitizeString', () => {
    it('should remove control characters', () => {
      const input = 'Hello\x00\x1F\x7FWorld'
      const result = sanitizeString(input)
      expect(result).toBe('HelloWorld')
    })

    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World'
      const result = sanitizeString(input)
      expect(result).toBe('Hello  World')
    })

    it('should remove dangerous HTML tags', () => {
      const input = 'Hello <iframe src="evil.com"></iframe> World'
      const result = sanitizeString(input)
      expect(result).toBe('Hello  World')
    })

    it('should normalize whitespace', () => {
      const input = 'Hello    \n\t   World'
      const result = sanitizeString(input)
      expect(result).toBe('Hello World')
    })

    it('should handle non-string input', () => {
      expect(sanitizeString(null)).toBe('')
      expect(sanitizeString(undefined)).toBe('')
      expect(sanitizeString(123)).toBe('')
    })
  })

  describe('validateDescription', () => {
    it('should validate correct description', () => {
      const description = 'This is a valid feature description for testing purposes'
      const result = validateDescription(description)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.sanitized).toBe(description)
    })

    it('should reject too short description', () => {
      const description = 'short'
      const result = validateDescription(description)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La descrizione deve essere di almeno 10 caratteri')
    })

    it('should reject too long description', () => {
      const description = 'a'.repeat(2001)
      const result = validateDescription(description)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La descrizione non può superare i 2000 caratteri')
    })

    it('should reject empty description', () => {
      const result = validateDescription('')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La descrizione è obbligatoria')
    })

    it('should reject null/undefined description', () => {
      expect(validateDescription(null).isValid).toBe(false)
      expect(validateDescription(undefined).isValid).toBe(false)
    })

    it('should detect too many URLs', () => {
      const description = 'Check https://site1.com and https://site2.com and https://site3.com for more info'
      const result = validateDescription(description)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Troppi link nella descrizione')
    })

    it('should detect repeated characters', () => {
      const description = 'This is a test with aaaaaaaaaaaaa repeated characters'
      const result = validateDescription(description)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La descrizione contiene pattern non validi')
    })
  })

  describe('validateFeatureRequest', () => {
    it('should validate correct request', () => {
      const request = {
        description: 'Valid feature description for comprehensive testing',
        language: 'it',
        complexity: 'medium',
        template: 'auth',
        includeTests: true
      }
      
      const result = validateFeatureRequest(request)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.sanitized).toEqual(expect.objectContaining({
        description: request.description,
        language: 'it',
        complexity: 'medium',
        template: 'auth',
        includeTests: true
      }))
    })

    it('should apply defaults for missing optional fields', () => {
      const request = {
        description: 'Valid feature description for default testing'
      }
      
      const result = validateFeatureRequest(request)
      
      expect(result.isValid).toBe(true)
      expect(result.sanitized.language).toBe('it')
      expect(result.sanitized.complexity).toBe('medium')
      expect(result.sanitized.includeTests).toBe(false)
    })

    it('should reject invalid language', () => {
      const request = {
        description: 'Valid feature description for language testing',
        language: 'fr'
      }
      
      const result = validateFeatureRequest(request)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Lingua non supportata. Valori ammessi: it, en')
    })

    it('should reject invalid complexity', () => {
      const request = {
        description: 'Valid feature description for complexity testing',
        complexity: 'invalid'
      }
      
      const result = validateFeatureRequest(request)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Complessità non valida. Valori ammessi: simple, medium, complex')
    })

    it('should reject invalid template', () => {
      const request = {
        description: 'Valid feature description for template testing',
        template: 'invalid'
      }
      
      const result = validateFeatureRequest(request)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Template non valido. Valori ammessi: crud, auth, ecommerce, api, dashboard')
    })

    it('should reject non-boolean includeTests', () => {
      const request = {
        description: 'Valid feature description for includeTests testing',
        includeTests: 'yes'
      }
      
      const result = validateFeatureRequest(request)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('includeTests deve essere un valore booleano')
    })
  })

  describe('sanitizeJsonForDisplay', () => {
    it('should escape HTML characters', () => {
      const data = {
        name: '<script>alert("xss")</script>',
        description: 'Test & validation'
      }
      
      const result = sanitizeJsonForDisplay(data)
      
      expect(result).toContain('&lt;script&gt;')
      expect(result).toContain('&amp;')
      expect(result).not.toContain('<script>')
    })

    it('should handle circular references', () => {
      const data = { name: 'test' }
      data.self = data
      
      const result = sanitizeJsonForDisplay(data)
      
      expect(result).toBe('Errore nella visualizzazione dei dati')
    })

    it('should handle null/undefined', () => {
      expect(sanitizeJsonForDisplay(null)).toContain('null')
      expect(sanitizeJsonForDisplay(undefined)).toContain('undefined')
    })
  })

  describe('generateCacheKey', () => {
    it('should generate consistent keys for same data', () => {
      const data1 = {
        description: 'Test description',
        language: 'it',
        complexity: 'medium'
      }
      
      const data2 = {
        complexity: 'medium',
        description: 'Test description',
        language: 'it'
      }
      
      const key1 = generateCacheKey(data1)
      const key2 = generateCacheKey(data2)
      
      expect(key1).toBe(key2)
    })

    it('should generate different keys for different data', () => {
      const data1 = {
        description: 'Test description 1',
        language: 'it'
      }
      
      const data2 = {
        description: 'Test description 2',
        language: 'it'
      }
      
      const key1 = generateCacheKey(data1)
      const key2 = generateCacheKey(data2)
      
      expect(key1).not.toBe(key2)
    })

    it('should handle missing optional fields', () => {
      const data = {
        description: 'Test description'
      }
      
      const key = generateCacheKey(data)
      
      expect(key).toBeTruthy()
      expect(typeof key).toBe('string')
    })

    it('should sanitize description in key', () => {
      const data = {
        description: '  Test Description  '
      }
      
      const key = generateCacheKey(data)
      
      expect(key).toBeTruthy()
    })
  })

  describe('validateStorageData', () => {
    it('should validate correct storage data', () => {
      const data = {
        data: { feature: { name: 'Test' } },
        timestamp: Date.now(),
        cacheKey: 'test-key'
      }
      
      const result = validateStorageData(data)
      
      expect(result).toEqual(data)
    })

    it('should reject data without required fields', () => {
      const data = {
        data: { feature: { name: 'Test' } }
        // Missing timestamp and cacheKey
      }
      
      const result = validateStorageData(data)
      
      expect(result).toBe(null)
    })

    it('should reject too old data', () => {
      const data = {
        data: { feature: { name: 'Test' } },
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 ore fa
        cacheKey: 'test-key'
      }
      
      const result = validateStorageData(data)
      
      expect(result).toBe(null)
    })

    it('should reject future timestamps', () => {
      const data = {
        data: { feature: { name: 'Test' } },
        timestamp: Date.now() + (60 * 60 * 1000), // 1 ora nel futuro
        cacheKey: 'test-key'
      }
      
      const result = validateStorageData(data)
      
      expect(result).toBe(null)
    })

    it('should handle invalid input', () => {
      expect(validateStorageData(null)).toBe(null)
      expect(validateStorageData(undefined)).toBe(null)
      expect(validateStorageData('string')).toBe(null)
      expect(validateStorageData(123)).toBe(null)
    })
  })
})