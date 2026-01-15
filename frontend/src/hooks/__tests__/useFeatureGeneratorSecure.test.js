import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import useFeatureGeneration from '../useFeatureGeneration'
import featureApiService from '../../services/featureApi'

// Mock del servizio API
vi.mock('../../services/featureApi', () => ({
  default: {
    generateFeature: vi.fn()
  }
}))

describe('useFeatureGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useFeatureGeneration())

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)
    expect(result.current.progress).toBe(null)
    expect(result.current.retryCount).toBe(0)
  })

  it('should handle successful feature generation', async () => {
    const mockResponse = {
      success: true,
      data: {
        feature: {
          name: 'Test Feature',
          complexity: 'medium'
        }
      }
    }

    featureApiService.generateFeature.mockResolvedValueOnce(mockResponse)

    const onSuccess = vi.fn()
    const { result } = renderHook(() => 
      useFeatureGeneration({ onSuccess })
    )

    act(() => {
      result.current.generateFeature({
        description: 'Test feature description for testing purposes'
      })
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.progress).toBe('Validazione dati...')

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockResponse)
    expect(result.current.error).toBe(null)
    expect(onSuccess).toHaveBeenCalledWith(mockResponse, expect.any(Number), false)
  })

  it('should handle cache functionality', async () => {
    const mockResponse = {
      success: true,
      data: {
        feature: {
          name: 'Cached Feature',
          complexity: 'medium'
        }
      }
    }

    featureApiService.generateFeature.mockResolvedValueOnce(mockResponse)

    const onSuccess = vi.fn()
    const { result } = renderHook(() => 
      useFeatureGeneration({ 
        onSuccess,
        enableCache: true 
      })
    )

    const requestData = {
      description: 'Test feature description for cache testing'
    }

    // Prima chiamata - va al server
    await act(async () => {
      await result.current.generateFeature(requestData)
    })

    expect(result.current.fromCache).toBe(false)
    expect(onSuccess).toHaveBeenCalledWith(mockResponse, expect.any(Number), false)

    // Reset per seconda chiamata
    act(() => {
      result.current.reset()
    })

    // Seconda chiamata identica - dovrebbe usare cache
    await act(async () => {
      await result.current.generateFeature(requestData)
    })

    expect(result.current.fromCache).toBe(true)
    expect(onSuccess).toHaveBeenCalledWith(mockResponse, 0, true)
  })

  it('should handle retry logic correctly', async () => {
    const retryableError = {
      code: 'REQUEST_TIMEOUT',
      message: 'Request timeout'
    }

    featureApiService.generateFeature
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValueOnce({
        success: true,
        data: { feature: { name: 'Retry Success' } }
      })

    const { result } = renderHook(() => 
      useFeatureGeneration({ 
        autoRetry: true, 
        maxRetries: 1 
      })
    )

    act(() => {
      result.current.generateFeature({
        description: 'Test description for retry functionality testing'
      })
    })

    // Primo tentativo fallisce
    await waitFor(() => {
      expect(result.current.retryCount).toBe(1)
    })

    // Avanza timer per retry
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Secondo tentativo ha successo
    await waitFor(() => {
      expect(result.current.data).toBeTruthy()
      expect(result.current.retryCount).toBe(0)
    })
  })

  it('should cancel requests correctly', async () => {
    featureApiService.generateFeature.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 5000))
    )

    const { result } = renderHook(() => useFeatureGeneration())

    act(() => {
      result.current.generateFeature({
        description: 'Test description for cancellation testing'
      })
    })

    expect(result.current.loading).toBe(true)

    act(() => {
      result.current.cancel()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.progress).toBe(null)
  })

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useFeatureGeneration())

    act(() => {
      result.current.reset()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)
    expect(result.current.progress).toBe(null)
    expect(result.current.retryCount).toBe(0)
    expect(result.current.fromCache).toBe(false)
  })

  it('should provide correct derived states', () => {
    const { result } = renderHook(() => useFeatureGeneration())

    expect(result.current.isIdle).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.hasProgress).toBe(false)
    expect(result.current.canRetry).toBe(false)
  })

  it('should clear cache correctly', () => {
    const { result } = renderHook(() => 
      useFeatureGeneration({ enableCache: true })
    )

    act(() => {
      result.current.clearCache()
    })

    expect(result.current.cacheStats.memorySize).toBe(0)
  })
})