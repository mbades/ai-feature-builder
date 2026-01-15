import axios from 'axios'
import { API_ENDPOINTS, API_CONFIG, ERROR_CODES, ERROR_MESSAGES } from '../config/api'
import { validateFeatureRequest } from '../utils/validation'

/**
 * Modulo API sicuro e standardizzato per la generazione di feature
 * Fix: Endpoint standardizzato, validazione sicura, gestione errori consistente
 */

// Configurazione axios sicura
const featureApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // CSRF protection
  }
})

// Request interceptor per logging e tracking
featureApi.interceptors.request.use(
  (config) => {
    // Aggiungi timestamp per tracking performance
    config.metadata = { 
      startTime: Date.now(),
      requestId: generateRequestId()
    }
    
    // Log in development (solo errori)
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Feature API Request Error:', error)
    return Promise.reject(transformError(error))
  }
)

// Response interceptor per gestione errori e logging
featureApi.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime
    const requestId = response.config.metadata.requestId
    
    // Log successo in development (solo se errori)
    if (import.meta.env.DEV && response.status >= 400) {
      console.log(`API Response: ${response.status} ${response.config.url}`)
    }
    
    // Aggiungi metadata alla response
    if (response.data && typeof response.data === 'object') {
      response.data._metadata = {
        requestId,
        duration,
        timestamp: new Date().toISOString()
      }
    }
    
    return response
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0
    const requestId = error.config?.metadata?.requestId
    
    // Log errore dettagliato
    console.error('❌ Feature API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      duration: duration ? `${duration}ms` : 'unknown',
      requestId,
      message: error.message,
      responseData: error.response?.data
    })
    
    return Promise.reject(transformError(error, requestId))
  }
)

/**
 * Genera un ID univoco per la richiesta
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Trasforma gli errori in formato consistente e sicuro
 */
function transformError(error, requestId = null) {
  const baseError = {
    message: ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR],
    code: ERROR_CODES.SERVER_ERROR,
    status: 0,
    details: null,
    requestId,
    timestamp: new Date().toISOString()
  }

  // Errori di rete (timeout, connessione)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        ...baseError,
        message: ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR],
        code: ERROR_CODES.TIMEOUT_ERROR
      }
    }
    
    if (error.code === 'ERR_NETWORK') {
      return {
        ...baseError,
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        code: ERROR_CODES.NETWORK_ERROR
      }
    }
    
    return {
      ...baseError,
      message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      code: error.code || ERROR_CODES.NETWORK_ERROR
    }
  }

  // Errori HTTP con response
  const { status, data } = error.response
  
  // Errori strutturati dal backend
  if (data?.error) {
    return {
      message: data.error.message || baseError.message,
      code: data.error.code || ERROR_CODES.SERVER_ERROR,
      status,
      details: data.error.details || null,
      requestId: data.error.requestId || requestId,
      timestamp: new Date().toISOString()
    }
  }

  // Messaggi di errore basati su status HTTP
  const getErrorByStatus = (status) => {
    switch (status) {
      case 400: return { code: ERROR_CODES.VALIDATION_ERROR, message: 'Richiesta non valida. Controlla i dati inseriti.' }
      case 401: return { code: ERROR_CODES.SERVER_ERROR, message: 'Non autorizzato. Ricarica la pagina e riprova.' }
      case 403: return { code: ERROR_CODES.SERVER_ERROR, message: 'Accesso negato al servizio.' }
      case 404: return { code: ERROR_CODES.SERVER_ERROR, message: 'Endpoint non trovato. Il servizio potrebbe essere in manutenzione.' }
      case 408: return { code: ERROR_CODES.TIMEOUT_ERROR, message: ERROR_MESSAGES[ERROR_CODES.TIMEOUT_ERROR] }
      case 413: return { code: ERROR_CODES.VALIDATION_ERROR, message: 'Descrizione troppo lunga. Riduci il testo e riprova.' }
      case 429: return { code: ERROR_CODES.RATE_LIMIT, message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT] }
      case 500: return { code: ERROR_CODES.SERVER_ERROR, message: ERROR_MESSAGES[ERROR_CODES.SERVER_ERROR] }
      case 502: return { code: ERROR_CODES.AI_SERVICE_ERROR, message: ERROR_MESSAGES[ERROR_CODES.AI_SERVICE_ERROR] }
      case 503: return { code: ERROR_CODES.SERVER_ERROR, message: 'Servizio in manutenzione. Riprova più tardi.' }
      case 504: return { code: ERROR_CODES.TIMEOUT_ERROR, message: 'Timeout del servizio AI. Riprova con una descrizione più semplice.' }
      default: return { code: ERROR_CODES.SERVER_ERROR, message: baseError.message }
    }
  }

  const errorInfo = getErrorByStatus(status)
  
  return {
    ...baseError,
    message: errorInfo.message,
    code: errorInfo.code,
    status
  }
}

/**
 * Classe principale per l'API delle feature - Versione sicura
 */
class FeatureApiService {
  /**
   * Genera una specifica tecnica da una descrizione
   * @param {Object} requestData - Dati della richiesta
   * @returns {Promise<Object>} Specifica tecnica generata
   */
  async generateFeature(requestData) {
    try {
      // Validazione e sanitizzazione input
      const validation = validateFeatureRequest(requestData)
      if (!validation.isValid) {
        throw {
          message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
          code: ERROR_CODES.VALIDATION_ERROR,
          status: 400,
          details: validation.errors,
          requestId: null,
          timestamp: new Date().toISOString()
        }
      }
      
      // Usa dati sanitizzati
      const cleanData = validation.sanitized
      
      // Esegui la chiamata API con endpoint standardizzato
      const response = await featureApi.post(API_ENDPOINTS.GENERATE_FEATURE, cleanData)
      
      // Verifica struttura response
      if (!response.data || !response.data.success) {
        throw {
          message: 'Risposta API non valida',
          code: ERROR_CODES.SERVER_ERROR,
          status: response.status,
          details: 'La risposta del server non ha il formato atteso',
          requestId: response.data?._metadata?.requestId,
          timestamp: new Date().toISOString()
        }
      }
      
      return response.data
      
    } catch (error) {
      // Se è già un errore trasformato, rilancialo
      if (error.code && error.message && error.timestamp) {
        throw error
      }
      
      // Altrimenti trasformalo
      throw transformError(error)
    }
  }
  
  /**
   * Verifica lo stato del servizio AI
   */
  async checkHealth() {
    try {
      const response = await featureApi.get(API_ENDPOINTS.HEALTH_CHECK)
      return response.data
    } catch (error) {
      throw transformError(error)
    }
  }
  
  /**
   * Ottiene i template disponibili
   */
  async getTemplates(params = {}) {
    try {
      const response = await featureApi.get(API_ENDPOINTS.TEMPLATES, { params })
      return response.data
    } catch (error) {
      throw transformError(error)
    }
  }
  
  /**
   * Ottiene le statistiche di utilizzo
   */
  async getUsageStats() {
    try {
      const response = await featureApi.get(API_ENDPOINTS.USAGE_STATS)
      return response.data
    } catch (error) {
      throw transformError(error)
    }
  }
}

// Crea istanza singleton
const featureApiService = new FeatureApiService()

// Export default e named exports
export default featureApiService
export { featureApiService, FeatureApiService }

// Export delle funzioni utility
export { transformError, generateRequestId }

// Export per compatibilità con il modulo esistente
export const generateFeature = (data) => featureApiService.generateFeature(data)
export const checkAiHealth = () => featureApiService.checkHealth()
export const getTemplates = (params) => featureApiService.getTemplates(params)
export const getUsageStats = () => featureApiService.getUsageStats()