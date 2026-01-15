import { VALIDATION_RULES, ERROR_CODES } from '../config/api'

/**
 * Utility per validazione e sanitizzazione sicura
 */

/**
 * Sanitizza stringa rimuovendo caratteri pericolosi
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    // Rimuovi caratteri di controllo
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Rimuovi script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Rimuovi altri tag HTML pericolosi
    .replace(/<(?:iframe|object|embed|link|meta|style)[^>]*>/gi, '')
    // Normalizza spazi
    .replace(/\s+/g, ' ')
}

/**
 * Valida descrizione feature
 */
export function validateDescription(description) {
  const errors = []
  
  if (!description || typeof description !== 'string') {
    errors.push('La descrizione è obbligatoria')
    return { isValid: false, errors, sanitized: '' }
  }

  const sanitized = sanitizeString(description)
  
  if (sanitized.length < VALIDATION_RULES.description.minLength) {
    errors.push(`La descrizione deve essere di almeno ${VALIDATION_RULES.description.minLength} caratteri`)
  }
  
  if (sanitized.length > VALIDATION_RULES.description.maxLength) {
    errors.push(`La descrizione non può superare i ${VALIDATION_RULES.description.maxLength} caratteri`)
  }

  // Controllo contenuto spam/inappropriato (base)
  const spamPatterns = [
    /(.)\1{10,}/i, // Caratteri ripetuti
    /https?:\/\/[^\s]+/gi, // URL (troppi)
    /\b(buy|sell|cheap|free|money|cash|prize|winner)\b/gi // Parole spam comuni
  ]

  const urlCount = (sanitized.match(/https?:\/\/[^\s]+/gi) || []).length
  if (urlCount > 2) {
    errors.push('Troppi link nella descrizione')
  }

  for (const pattern of spamPatterns.slice(0, 1)) { // Solo pattern caratteri ripetuti
    if (pattern.test(sanitized)) {
      errors.push('La descrizione contiene pattern non validi')
      break
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  }
}

/**
 * Valida request completa per feature generation
 */
export function validateFeatureRequest(requestData) {
  const errors = []
  const sanitized = {}

  // Valida descrizione
  const descValidation = validateDescription(requestData.description)
  if (!descValidation.isValid) {
    errors.push(...descValidation.errors)
  }
  sanitized.description = descValidation.sanitized

  // Valida lingua
  if (requestData.language) {
    if (!VALIDATION_RULES.language.allowedValues.includes(requestData.language)) {
      errors.push(`Lingua non supportata. Valori ammessi: ${VALIDATION_RULES.language.allowedValues.join(', ')}`)
    } else {
      sanitized.language = requestData.language
    }
  } else {
    sanitized.language = VALIDATION_RULES.language.default
  }

  // Valida complessità
  if (requestData.complexity) {
    if (!VALIDATION_RULES.complexity.allowedValues.includes(requestData.complexity)) {
      errors.push(`Complessità non valida. Valori ammessi: ${VALIDATION_RULES.complexity.allowedValues.join(', ')}`)
    } else {
      sanitized.complexity = requestData.complexity
    }
  } else {
    sanitized.complexity = VALIDATION_RULES.complexity.default
  }

  // Valida template
  if (requestData.template) {
    if (!VALIDATION_RULES.template.allowedValues.includes(requestData.template)) {
      errors.push(`Template non valido. Valori ammessi: ${VALIDATION_RULES.template.allowedValues.join(', ')}`)
    } else {
      sanitized.template = requestData.template
    }
  }

  // Valida includeTests
  if (requestData.includeTests !== undefined) {
    if (typeof requestData.includeTests !== 'boolean') {
      errors.push('includeTests deve essere un valore booleano')
    } else {
      sanitized.includeTests = requestData.includeTests
    }
  } else {
    sanitized.includeTests = VALIDATION_RULES.includeTests.default
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
    errorCode: errors.length > 0 ? ERROR_CODES.VALIDATION_ERROR : null
  }
}

/**
 * Sanitizza JSON per display sicuro
 */
export function sanitizeJsonForDisplay(data) {
  try {
    // Converti in stringa e sanitizza
    const jsonString = JSON.stringify(data, null, 2)
    
    // Rimuovi caratteri pericolosi che potrebbero causare XSS
    return jsonString
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  } catch (error) {
    return 'Errore nella visualizzazione dei dati'
  }
}

/**
 * Genera chiave cache deterministica
 */
export function generateCacheKey(requestData) {
  // Ordina le chiavi per garantire determinismo
  const normalized = {
    description: sanitizeString(requestData.description || '').toLowerCase(),
    language: requestData.language || 'it',
    complexity: requestData.complexity || 'medium',
    includeTests: Boolean(requestData.includeTests)
  }

  // Aggiungi template solo se presente
  if (requestData.template) {
    normalized.template = requestData.template
  }

  // Ordina le chiavi alfabeticamente
  const sortedKeys = Object.keys(normalized).sort()
  const sortedData = {}
  sortedKeys.forEach(key => {
    sortedData[key] = normalized[key]
  })

  return btoa(JSON.stringify(sortedData)).replace(/[+/=]/g, '')
}

/**
 * Valida dati da localStorage
 */
export function validateStorageData(data) {
  try {
    if (!data || typeof data !== 'object') return null
    
    // Verifica struttura base
    if (!data.data || !data.timestamp || !data.cacheKey) return null
    
    // Verifica età
    const age = Date.now() - data.timestamp
    if (age < 0 || age > 24 * 60 * 60 * 1000) return null // Max 24 ore
    
    return data
  } catch (error) {
    console.warn('Errore validazione storage:', error)
    return null
  }
}