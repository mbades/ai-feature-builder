import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Custom hook for API calls with loading, error, and abort support
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - API state and methods
 */
export function useApi(apiFunction, options = {}) {
  const {
    immediate = false,
    onSuccess = null,
    onError = null,
    transform = null
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  // Execute API call
  const execute = useCallback(async (...args) => {
    try {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      setLoading(true)
      setError(null)

      // Call API function
      const result = await apiFunction(...args)
      
      // Transform data if transformer provided
      const transformedData = transform ? transform(result) : result
      
      setData(transformedData)
      
      // Call success callback
      if (onSuccess) {
        onSuccess(transformedData)
      }

      return transformedData
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError') {
        setError(err)
        
        // Call error callback
        if (onError) {
          onError(err)
        }
      }
      
      throw err
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [apiFunction, transform, onSuccess, onError])

  // Reset state
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    
    // Abort current request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Abort current request
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset,
    abort
  }
}

/**
 * Hook for feature generation API
 */
export function useFeatureGeneration() {
  const apiFunction = useCallback(async (data) => {
    const { generateFeature } = await import('../services/api.js')
    return generateFeature(data)
  }, [])
  
  return useApi(apiFunction, {
    transform: (response) => response.data?.feature || null,
    onSuccess: (data) => {
      console.log('✅ Feature generated successfully:', data?.metadata?.name)
    },
    onError: (error) => {
      console.error('❌ Feature generation failed:', error.message)
    }
  })
}

/**
 * Hook for templates API
 */
export function useTemplates() {
  const apiFunction = useCallback(async (params) => {
    const { getTemplates } = await import('../services/api.js')
    return getTemplates(params)
  }, [])
  
  return useApi(apiFunction, {
    immediate: true,
    transform: (response) => response.data?.templates || [],
    onSuccess: (templates) => {
      console.log(`✅ Loaded ${templates.length} templates`)
    },
    onError: (error) => {
      console.error('❌ Failed to load templates:', error.message)
    }
  })
}

/**
 * Hook for health check API
 */
export function useHealthCheck() {
  const apiFunction = useCallback(async () => {
    const { getHealth } = await import('../services/api.js')
    return getHealth()
  }, [])
  
  return useApi(apiFunction, {
    transform: (response) => response.data || null
  })
}

/**
 * Generic hook for any async operation with loading/error states
 * @param {Function} asyncFunction - Async function to execute
 * @param {Array} dependencies - Dependencies array for useCallback
 * @returns {Object} - State and execute function
 */
export function useAsyncOperation(asyncFunction, dependencies = []) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await asyncFunction(...args)
      setData(result)
      
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, dependencies)

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}

/**
 * Hook for debounced API calls
 * @param {Function} apiFunction - API function to call
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Object} - Debounced API state and methods
 */
export function useDebouncedApi(apiFunction, delay = 500) {
  const [debouncedLoading, setDebouncedLoading] = useState(false)
  const timeoutRef = useRef(null)
  const api = useApi(apiFunction)

  const debouncedExecute = useCallback((...args) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setDebouncedLoading(true)

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        await api.execute(...args)
      } finally {
        setDebouncedLoading(false)
      }
    }, delay)
  }, [api.execute, delay])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...api,
    loading: api.loading || debouncedLoading,
    execute: debouncedExecute
  }
}