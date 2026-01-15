import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Hook base sicuro per operazioni asincrone
 * Risolve memory leaks, race conditions e cleanup issues
 */
export function useAsyncOperation(asyncFunction, options = {}) {
  const {
    onSuccess = null,
    onError = null,
    onStart = null,
    immediate = false
  } = options

  // Stato
  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null,
    requestId: null
  })

  // Refs per gestione sicura
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef(null)
  const currentRequestIdRef = useRef(null)

  /**
   * Aggiorna stato solo se componente è ancora montato
   */
  const safeSetState = useCallback((updater) => {
    if (isMountedRef.current) {
      setState(updater)
    }
  }, [])

  /**
   * Pulisce tutte le risorse attive
   */
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    currentRequestIdRef.current = null
  }, [])

  /**
   * Esegue operazione asincrona con protezione race condition
   */
  const execute = useCallback(async (...args) => {
    // Genera ID univoco per questa richiesta
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    currentRequestIdRef.current = requestId

    try {
      // Cleanup richiesta precedente
      cleanup()

      // Nuovo abort controller
      abortControllerRef.current = new AbortController()

      // Aggiorna stato iniziale
      safeSetState(prev => ({
        ...prev,
        loading: true,
        error: null,
        requestId
      }))

      // Callback di inizio
      if (onStart) {
        onStart(...args)
      }

      // Esegui operazione
      const result = await asyncFunction(...args)

      // Verifica se questa richiesta è ancora attuale
      if (currentRequestIdRef.current !== requestId || !isMountedRef.current) {
        return // Richiesta superata o componente smontato
      }

      // Aggiorna stato con successo
      safeSetState(prev => ({
        ...prev,
        loading: false,
        data: result,
        error: null
      }))

      // Callback successo
      if (onSuccess) {
        onSuccess(result)
      }

      return result

    } catch (error) {
      // Ignora errori se richiesta non più attuale
      if (currentRequestIdRef.current !== requestId || !isMountedRef.current) {
        return
      }

      // Ignora errori di abort
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        safeSetState(prev => ({ ...prev, loading: false }))
        return
      }

      // Aggiorna stato con errore
      safeSetState(prev => ({
        ...prev,
        loading: false,
        error,
        requestId
      }))

      // Callback errore
      if (onError) {
        onError(error)
      }

      throw error
    }
  }, [asyncFunction, onSuccess, onError, onStart, cleanup, safeSetState])

  /**
   * Reset stato
   */
  const reset = useCallback(() => {
    cleanup()
    safeSetState({
      loading: false,
      data: null,
      error: null,
      requestId: null
    })
  }, [cleanup, safeSetState])

  /**
   * Cancella operazione in corso
   */
  const cancel = useCallback(() => {
    cleanup()
    safeSetState(prev => ({
      ...prev,
      loading: false
    }))
  }, [cleanup, safeSetState])

  // Esecuzione immediata se richiesta
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  // Cleanup completo su unmount
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [cleanup])

  return {
    loading: state.loading,
    data: state.data,
    error: state.error,
    requestId: state.requestId,
    execute,
    reset,
    cancel,
    
    // Stati derivati
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !!state.data && !state.error && !state.loading,
    isIdle: !state.loading && !state.data && !state.error
  }
}

export default useAsyncOperation