import { useState, useCallback, useRef, useEffect } from 'react'
import featureApiService from '../services/featureApi'

/**
 * Custom hook per la generazione di feature con gestione completa degli stati
 * @param {Object} options - Opzioni di configurazione
 * @returns {Object} Stato e metodi per la generazione di feature
 */
export function useFeatureGeneration(options = {}) {
  const {
    onSuccess = null,
    onError = null,
    onStart = null,
    autoRetry = false,
    maxRetries = 2
  } = options

  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null,
    progress: null,
    requestId: null,
    retryCount: 0
  })

  const abortControllerRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  /**
   * Esegue la generazione della feature
   */
  const generateFeature = useCallback(async (requestData) => {
    try {
      // Cancella richiesta precedente se in corso
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Reset stato
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        data: null,
        progress: 'Preparazione richiesta...'
      }))

      // Callback di inizio
      if (onStart) {
        onStart(requestData)
      }

      // Simula progresso per UX migliore
      const progressSteps = [
        'Validazione dati...',
        'Invio richiesta al server...',
        'Elaborazione con AI...',
        'Generazione specifica...',
        'Finalizzazione...'
      ]

      let stepIndex = 0
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length - 1) {
          setState(prev => ({
            ...prev,
            progress: progressSteps[stepIndex]
          }))
          stepIndex++
        }
      }, 2000)

      // Esegui chiamata API
      const result = await featureApiService.generateFeature(requestData)

      // Pulisci interval
      clearInterval(progressInterval)

      // Aggiorna stato con successo
      setState(prev => ({
        ...prev,
        loading: false,
        data: result,
        error: null,
        progress: 'Completato!',
        requestId: result._metadata?.requestId || null,
        retryCount: 0
      }))

      // Callback di successo
      if (onSuccess) {
        onSuccess(result)
      }

      return result

    } catch (error) {
      // Pulisci interval se presente
      clearInterval(progressInterval)

      // Gestione retry automatico
      if (autoRetry && state.retryCount < maxRetries && shouldRetry(error)) {
        setState(prev => ({
          ...prev,
          retryCount: prev.retryCount + 1,
          progress: `Tentativo ${prev.retryCount + 2}/${maxRetries + 1}...`
        }))

        // Retry con backoff esponenziale
        const retryDelay = Math.pow(2, state.retryCount) * 1000
        retryTimeoutRef.current = setTimeout(() => {
          generateFeature(requestData)
        }, retryDelay)

        return
      }

      // Aggiorna stato con errore
      setState(prev => ({
        ...prev,
        loading: false,
        error,
        progress: null,
        requestId: error.requestId || null
      }))

      // Callback di errore
      if (onError) {
        onError(error)
      }

      throw error
    }
  }, [onSuccess, onError, onStart, autoRetry, maxRetries, state.retryCount])

  /**
   * Reset dello stato
   */
  const reset = useCallback(() => {
    // Cancella richieste in corso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }

    setState({
      loading: false,
      data: null,
      error: null,
      progress: null,
      requestId: null,
      retryCount: 0
    })
  }, [])

  /**
   * Cancella la richiesta in corso
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }

    setState(prev => ({
      ...prev,
      loading: false,
      progress: null
    }))
  }, [])

  /**
   * Retry manuale
   */
  const retry = useCallback((requestData) => {
    setState(prev => ({ ...prev, retryCount: 0 }))
    return generateFeature(requestData)
  }, [generateFeature])

  // Cleanup su unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Stato
    loading: state.loading,
    data: state.data,
    error: state.error,
    progress: state.progress,
    requestId: state.requestId,
    retryCount: state.retryCount,
    
    // Metodi
    generateFeature,
    reset,
    cancel,
    retry,
    
    // Stato derivato
    canRetry: !state.loading && state.error && shouldRetry(state.error),
    isRetrying: state.retryCount > 0 && state.loading
  }
}

/**
 * Hook per il controllo dello stato del servizio AI
 */
export function useAiHealthCheck(options = {}) {
  const { interval = 30000, immediate = false } = options
  
  const [state, setState] = useState({
    loading: false,
    healthy: null,
    lastCheck: null,
    error: null
  })

  const intervalRef = useRef(null)

  const checkHealth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await featureApiService.checkHealth()
      
      setState({
        loading: false,
        healthy: result.healthy || result.status === 'ok',
        lastCheck: new Date(),
        error: null
      })
      
      return result
    } catch (error) {
      setState({
        loading: false,
        healthy: false,
        lastCheck: new Date(),
        error
      })
      throw error
    }
  }, [])

  // Avvia controllo periodico
  const startPeriodicCheck = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(checkHealth, interval)
  }, [checkHealth, interval])

  // Ferma controllo periodico
  const stopPeriodicCheck = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Controllo immediato se richiesto
  useEffect(() => {
    if (immediate) {
      checkHealth()
    }
  }, [immediate, checkHealth])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    loading: state.loading,
    healthy: state.healthy,
    lastCheck: state.lastCheck,
    error: state.error,
    checkHealth,
    startPeriodicCheck,
    stopPeriodicCheck
  }
}

/**
 * Hook per statistiche di utilizzo
 */
export function useUsageStats() {
  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null,
    lastFetch: null
  })

  const fetchStats = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const result = await featureApiService.getUsageStats()
      
      setState({
        loading: false,
        data: result,
        error: null,
        lastFetch: new Date()
      })
      
      return result
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error
      }))
      throw error
    }
  }, [])

  return {
    loading: state.loading,
    data: state.data,
    error: state.error,
    lastFetch: state.lastFetch,
    fetchStats
  }
}

/**
 * Determina se un errore è recuperabile con retry
 */
function shouldRetry(error) {
  if (!error || !error.code) return false
  
  const retryableCodes = [
    'REQUEST_TIMEOUT',
    'NETWORK_ERROR',
    'CONNECTION_ERROR',
    'HTTP_500',
    'HTTP_502',
    'HTTP_503',
    'HTTP_504'
  ]
  
  return retryableCodes.includes(error.code)
}

// Export utility functions
export { shouldRetry }