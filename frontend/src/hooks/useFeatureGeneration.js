import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useAsyncOperation } from './core/useAsyncOperation'
import featureApiService from '../services/featureApi'
import { ERROR_CODES, API_CONFIG } from '../config/api'
import { generateCacheKey, validateStorageData } from '../utils/validation'

/**
 * Hook unificato e ottimizzato per generazione feature
 * Consolida funzionalità di tutti gli hook precedenti
 * 
 * @param {Object} options - Configurazione
 * @param {Function} options.onSuccess - Callback successo
 * @param {Function} options.onError - Callback errore
 * @param {Function} options.onProgress - Callback progress
 * @param {boolean} options.autoRetry - Abilita retry automatico
 * @param {number} options.maxRetries - Numero massimo retry
 * @param {number} options.retryDelay - Delay base retry (ms)
 * @param {boolean} options.enableCache - Abilita cache
 * @param {boolean} options.enablePersistence - Abilita localStorage
 * @param {number} options.cacheTimeout - Timeout cache (ms)
 * @param {string} options.storageKey - Chiave localStorage
 * @returns {Object} Stato e metodi
 */
export function useFeatureGeneration(options = {}) {
  const {
    onSuccess = null,
    onError = null,
    onProgress = null,
    autoRetry = false,
    maxRetries = 2,
    retryDelay = 1000,
    enableCache = false,
    enablePersistence = false,
    cacheTimeout = API_CONFIG.CACHE_TTL,
    storageKey = 'featureGenerator'
  } = options

  // Stato progress e retry
  const [progressState, setProgressState] = useState({
    progress: null,
    retryCount: 0,
    duration: null,
    startTime: null
  })

  // Stato cache
  const [cacheState, setCacheState] = useState({
    fromCache: false,
    cacheTimestamp: null
  })

  // Refs per gestione sicura
  const progressIntervalRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const cacheRef = useRef(new Map())
  const isMountedRef = useRef(true)

  /**
   * Pulisce risorse progress e retry
   */
  const cleanupProgress = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  /**
   * Aggiorna progress solo se montato
   */
  const safeSetProgress = useCallback((updater) => {
    if (isMountedRef.current) {
      setProgressState(updater)
    }
  }, [])

  /**
   * Aggiorna cache state solo se montato
   */
  const safeSetCache = useCallback((updater) => {
    if (isMountedRef.current) {
      setCacheState(updater)
    }
  }, [])

  /**
   * Carica dati da localStorage
   */
  const loadFromStorage = useCallback(() => {
    if (!enablePersistence) return null

    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      const validated = validateStorageData(parsed)
      
      if (!validated) return null

      // Verifica scadenza
      if (Date.now() - validated.timestamp > cacheTimeout) {
        localStorage.removeItem(storageKey)
        return null
      }

      return validated
    } catch (error) {
      console.warn('Errore caricamento localStorage:', error)
      return null
    }
  }, [enablePersistence, storageKey, cacheTimeout])

  /**
   * Salva dati in localStorage
   */
  const saveToStorage = useCallback((data, cacheKey) => {
    if (!enablePersistence) return

    try {
      const toStore = {
        data,
        cacheKey,
        timestamp: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(toStore))
    } catch (error) {
      console.warn('Errore salvataggio localStorage:', error)
    }
  }, [enablePersistence, storageKey])

  /**
   * Cerca nei cache
   */
  const findInCache = useCallback((cacheKey) => {
    // Cache in memoria
    if (enableCache && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)
      
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return { data: cached.data, source: 'memory' }
      } else {
        cacheRef.current.delete(cacheKey)
      }
    }

    // Cache localStorage
    const stored = loadFromStorage()
    if (stored && stored.cacheKey === cacheKey) {
      return { data: stored.data, source: 'storage' }
    }

    return null
  }, [enableCache, cacheTimeout, loadFromStorage])

  /**
   * Salva in cache
   */
  const saveToCache = useCallback((cacheKey, data) => {
    if (enableCache) {
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
    }
    saveToStorage(data, cacheKey)
  }, [enableCache, saveToStorage])

  /**
   * Simula progress realistico
   */
  const startProgressTracking = useCallback(() => {
    const steps = [
      'Validazione dati...',
      'Invio richiesta al server...',
      'Elaborazione con AI...',
      'Generazione specifica tecnica...',
      'Ottimizzazione risultati...',
      'Finalizzazione...'
    ]

    let currentStep = 0
    const startTime = Date.now()

    const updateProgress = () => {
      if (!isMountedRef.current) return

      if (currentStep < steps.length) {
        const message = steps[currentStep]
        const duration = Date.now() - startTime

        safeSetProgress(prev => ({
          ...prev,
          progress: message,
          duration,
          startTime
        }))

        if (onProgress) {
          onProgress(message, currentStep, steps.length, duration)
        }

        currentStep++
      }
    }

    updateProgress()
    progressIntervalRef.current = setInterval(updateProgress, 2000)
  }, [onProgress, safeSetProgress])

  /**
   * Funzione asincrona per generazione
   */
  const generateFeatureAsync = useCallback(async (requestData) => {
    // Genera chiave cache
    const cacheKey = generateCacheKey(requestData)

    // Cerca in cache se abilitata
    if (enableCache || enablePersistence) {
      const cached = findInCache(cacheKey)
      if (cached) {
        safeSetCache({
          fromCache: true,
          cacheTimestamp: Date.now()
        })

        if (onSuccess) {
          onSuccess(cached.data, 0, true)
        }

        return cached.data
      }
    }

    // Reset cache state
    safeSetCache({
      fromCache: false,
      cacheTimestamp: null
    })

    // Avvia tracking progress
    startProgressTracking()

    try {
      const result = await featureApiService.generateFeature(requestData)
      
      // Calcola durata finale
      const finalDuration = progressState.startTime 
        ? Date.now() - progressState.startTime 
        : null

      safeSetProgress(prev => ({
        ...prev,
        progress: 'Completato!',
        duration: finalDuration,
        retryCount: 0
      }))

      // Salva in cache
      if (enableCache || enablePersistence) {
        saveToCache(cacheKey, result)
      }

      return result
    } finally {
      cleanupProgress()
    }
  }, [
    enableCache,
    enablePersistence,
    findInCache,
    saveToCache,
    startProgressTracking,
    progressState.startTime,
    safeSetProgress,
    safeSetCache,
    cleanupProgress,
    onSuccess
  ])

  // TEMPORARY: Stato diretto ottimizzato
  const [directState, setDirectState] = useState({
    loading: false,
    data: null,
    error: null
  });

  // Funzione diretta ottimizzata
  const generateFeatureDirect = useCallback(async (requestData) => {
    setDirectState({ loading: true, data: null, error: null });
    
    try {
      const result = await featureApiService.generateFeature(requestData);
      
      setDirectState({ loading: false, data: result, error: null });
      
      if (onSuccess) {
        onSuccess(result, 0, false);
      }
      
      return result;
    } catch (error) {
      setDirectState({ loading: false, data: null, error });
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }, [onSuccess, onError]);

  // Versione semplificata per debug
  const generateFeatureSimple = useCallback(async (requestData) => {
    console.log('🚀 generateFeatureSimple called');
    const result = await featureApiService.generateFeature(requestData);
    console.log('✅ generateFeatureSimple result:', result);
    return result;
  }, []);

  // Hook base per operazioni async
  const {
    loading,
    data,
    error,
    requestId,
    execute: baseExecute,
    reset: baseReset,
    cancel: baseCancel,
    isLoading,
    isError,
    isSuccess,
    isIdle
  } = useAsyncOperation(generateFeatureSimple, {
    onSuccess: (result) => {
      if (!cacheState.fromCache && onSuccess) {
        onSuccess(result, progressState.duration, false)
      }
    },
    onError: (error) => {
      cleanupProgress()
      
      // Gestione retry automatico
      if (autoRetry && 
          progressState.retryCount < maxRetries && 
          shouldRetry(error)) {
        
        const nextRetryCount = progressState.retryCount + 1
        const backoffDelay = retryDelay * Math.pow(2, progressState.retryCount)

        safeSetProgress(prev => ({
          ...prev,
          retryCount: nextRetryCount,
          progress: `Nuovo tentativo ${nextRetryCount}/${maxRetries}...`
        }))

        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            baseExecute()
          }
        }, backoffDelay)

        return
      }

      safeSetProgress(prev => ({
        ...prev,
        progress: null
      }))

      if (onError) {
        onError(error, progressState.duration)
      }
    }
  })

  /**
   * Genera feature con validazione
   */
  const generateFeature = useCallback(async (requestData) => {
    safeSetProgress(prev => ({ ...prev, retryCount: 0 }))
    return baseExecute(requestData)
  }, [baseExecute, safeSetProgress])

  /**
   * Reset completo
   */
  const reset = useCallback((clearCache = false) => {
    cleanupProgress()
    safeSetProgress({
      progress: null,
      retryCount: 0,
      duration: null,
      startTime: null
    })
    safeSetCache({
      fromCache: false,
      cacheTimestamp: null
    })
    
    if (clearCache) {
      cacheRef.current.clear()
      if (enablePersistence) {
        localStorage.removeItem(storageKey)
      }
    }
    
    baseReset()
  }, [cleanupProgress, safeSetProgress, safeSetCache, baseReset, enablePersistence, storageKey])

  /**
   * Cancella con cleanup
   */
  const cancel = useCallback(() => {
    cleanupProgress()
    safeSetProgress(prev => ({ ...prev, progress: null }))
    baseCancel()
  }, [cleanupProgress, safeSetProgress, baseCancel])

  /**
   * Retry manuale
   */
  const retry = useCallback(() => {
    safeSetProgress(prev => ({ ...prev, retryCount: 0 }))
    return baseExecute()
  }, [safeSetProgress, baseExecute])

  /**
   * Pulisce cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
    if (enablePersistence) {
      localStorage.removeItem(storageKey)
    }
  }, [enablePersistence, storageKey])

  // Stati derivati memoizzati
  const derivedState = useMemo(() => ({
    // Progress info
    hasProgress: !!progressState.progress,
    progressPercentage: calculateProgressPercentage(progressState.duration),
    
    // Retry info
    canRetry: !loading && error && shouldRetry(error),
    isRetrying: progressState.retryCount > 0 && loading,
    hasRetriesLeft: progressState.retryCount < maxRetries,
    retriesRemaining: Math.max(0, maxRetries - progressState.retryCount),
    
    // Cache info
    fromCache: cacheState.fromCache,
    cacheTimestamp: cacheState.cacheTimestamp,
    cacheStats: {
      memorySize: cacheRef.current.size,
      hasStorageData: !!loadFromStorage(),
      cacheAge: cacheState.cacheTimestamp ? Date.now() - cacheState.cacheTimestamp : null
    },
    
    // Error info
    errorType: error?.code || null,
    errorMessage: error?.message || null,
    isNetworkError: error?.code === ERROR_CODES.NETWORK_ERROR,
    isTimeoutError: error?.code === ERROR_CODES.TIMEOUT_ERROR,
    isValidationError: error?.code === ERROR_CODES.VALIDATION_ERROR,
    isServerError: error?.status >= 500,
    
    // Performance info
    lastDuration: progressState.duration
  }), [loading, error, progressState, cacheState, maxRetries, loadFromStorage])

  // Carica dati persistenti all'avvio
  useEffect(() => {
    if (enablePersistence) {
      const stored = loadFromStorage()
      if (stored) {
        safeSetCache({
          fromCache: true,
          cacheTimestamp: stored.timestamp
        })
      }
    }
  }, [enablePersistence, loadFromStorage, safeSetCache])

  // Cleanup su unmount
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      cleanupProgress()
    }
  }, [cleanupProgress])

  return {
    // Stato base
    loading: directState.loading,
    data: directState.data,
    error: directState.error,
    requestId: 'direct',
    
    // Stato progress
    progress: progressState.progress,
    retryCount: progressState.retryCount,
    duration: progressState.duration,
    
    // Stati derivati
    isLoading: directState.loading,
    isError: !!directState.error,
    isSuccess: !!directState.data && !directState.error && !directState.loading,
    isIdle: !directState.loading && !directState.data && !directState.error,
    ...derivedState,
    
    // Metodi
    generateFeature: generateFeatureDirect,
    reset: () => setDirectState({ loading: false, data: null, error: null }),
    cancel: () => setDirectState(prev => ({ ...prev, loading: false })),
    retry: generateFeatureDirect,
    clearCache
  }
}

/**
 * Determina se un errore è recuperabile
 */
function shouldRetry(error) {
  if (!error?.code) return false
  
  const retryableCodes = [
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.SERVER_ERROR,
    ERROR_CODES.AI_SERVICE_ERROR
  ]
  
  return retryableCodes.includes(error.code)
}

/**
 * Calcola percentuale progresso stimata
 */
function calculateProgressPercentage(duration) {
  if (!duration) return 0
  
  const estimatedTotal = 15000
  const percentage = Math.min(90, (duration / estimatedTotal) * 100)
  
  return Math.round(percentage)
}

export default useFeatureGeneration