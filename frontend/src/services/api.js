import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 minutes for AI generation
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add request timestamp for tracking
    config.metadata = { startTime: Date.now() }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata.startTime
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      })
    }
    
    return response
  },
  (error) => {
    // Calculate request duration if available
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0
    
    // Enhanced error logging
    console.error('❌ API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      duration: duration ? `${duration}ms` : 'unknown',
      message: error.message,
      data: error.response?.data
    })
    
    // Transform error for consistent handling
    const transformedError = transformApiError(error)
    return Promise.reject(transformedError)
  }
)

/**
 * Transform API errors into consistent format
 */
function transformApiError(error) {
  const baseError = {
    message: 'Si è verificato un errore imprevisto',
    code: 'UNKNOWN_ERROR',
    status: 0,
    details: null,
    requestId: null
  }

  // Network errors
  if (!error.response) {
    return {
      ...baseError,
      message: error.code === 'ECONNABORTED' 
        ? 'Richiesta scaduta. Riprova più tardi.' 
        : 'Errore di connessione. Controlla la tua connessione internet.',
      code: error.code || 'NETWORK_ERROR'
    }
  }

  // HTTP errors with response
  const { status, data } = error.response
  
  if (data?.error) {
    return {
      message: data.error.message || baseError.message,
      code: data.error.code || 'API_ERROR',
      status,
      details: data.error.details || null,
      requestId: data.error.errorId || null
    }
  }

  // HTTP status based messages
  const statusMessages = {
    400: 'Richiesta non valida. Controlla i dati inseriti.',
    401: 'Non autorizzato. Ricarica la pagina e riprova.',
    403: 'Accesso negato.',
    404: 'Risorsa non trovata.',
    408: 'Richiesta scaduta. Riprova più tardi.',
    413: 'Richiesta troppo grande. Riduci la lunghezza del testo.',
    429: 'Troppe richieste. Attendi un momento prima di riprovare.',
    500: 'Errore interno del server. Riprova più tardi.',
    502: 'Servizio temporaneamente non disponibile.',
    503: 'Servizio in manutenzione. Riprova più tardi.'
  }

  return {
    ...baseError,
    message: statusMessages[status] || baseError.message,
    code: `HTTP_${status}`,
    status
  }
}

/**
 * API Service class with methods for all endpoints
 */
class ApiService {
  /**
   * Generate feature specification
   * @param {Object} data - Feature generation data
   * @returns {Promise<Object>} - Generated feature specification
   */
  async generateFeature(data) {
    try {
      const response = await api.post('/generate-spec', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get available templates
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Templates list
   */
  async getTemplates(params = {}) {
    try {
      const response = await api.get('/templates', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get API health status
   * @returns {Promise<Object>} - Health status
   */
  async getHealth() {
    try {
      const response = await api.get('/ai-health')
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get cache statistics (development only)
   * @returns {Promise<Object>} - Cache statistics
   */
  async getCacheStats() {
    try {
      const response = await api.get('/cache-stats')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

// Create singleton instance
const apiService = new ApiService()

// Export both the service and axios instance
export default apiService
export { api }

// Export individual methods for convenience
export const {
  generateFeature,
  getTemplates,
  getHealth,
  getCacheStats
} = apiService