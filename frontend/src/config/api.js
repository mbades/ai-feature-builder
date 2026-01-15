/**
 * Configurazione centralizzata API
 * Standardizza tutti gli endpoint e configurazioni
 */

// Endpoint API standardizzati (basati su api-specification.md)
export const API_ENDPOINTS = {
  GENERATE_FEATURE: '/api/generate-spec', // Endpoint completo
  HEALTH_CHECK: '/ai-health',
  TEMPLATES: '/templates',
  CACHE_STATS: '/cache-stats',
  USAGE_STATS: '/usage-stats'
}

// Configurazioni API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: 120000, // 2 minuti per AI generation
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TTL: 10 * 60 * 1000, // 10 minuti
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_DESCRIPTION_LENGTH: 10
}

// Tipi di errore standardizzati
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'REQUEST_TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR'
}

// Messaggi di errore localizzati
export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Dati di input non validi',
  [ERROR_CODES.NETWORK_ERROR]: 'Errore di connessione. Controlla la tua connessione internet.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'La richiesta sta richiedendo troppo tempo. Riprova con una descrizione più semplice.',
  [ERROR_CODES.SERVER_ERROR]: 'Errore interno del server. Riprova più tardi.',
  [ERROR_CODES.RATE_LIMIT]: 'Troppe richieste. Attendi un momento prima di riprovare.',
  [ERROR_CODES.AI_SERVICE_ERROR]: 'Servizio AI temporaneamente non disponibile.',
  [ERROR_CODES.CACHE_ERROR]: 'Errore nella gestione della cache'
}

// Validazione request
export const VALIDATION_RULES = {
  description: {
    minLength: API_CONFIG.MIN_DESCRIPTION_LENGTH,
    maxLength: API_CONFIG.MAX_DESCRIPTION_LENGTH,
    required: true
  },
  language: {
    allowedValues: ['it', 'en'],
    default: 'it'
  },
  complexity: {
    allowedValues: ['simple', 'medium', 'complex'],
    default: 'medium'
  },
  template: {
    allowedValues: ['crud', 'auth', 'ecommerce', 'api', 'dashboard'],
    required: false
  },
  includeTests: {
    type: 'boolean',
    default: false
  }
}