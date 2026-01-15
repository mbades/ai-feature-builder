import React, { useState } from 'react'
import useFeatureGenerator from '../hooks/useFeatureGenerator'
import useSimpleFeatureGenerator from '../hooks/useSimpleFeatureGenerator'
import useFeatureGeneratorWithCache from '../hooks/useFeatureGeneratorWithCache'

/**
 * Componente di esempio per dimostrare i hook migliorati
 */
export default function ImprovedHooksExample() {
  const [activeHook, setActiveHook] = useState('advanced')
  const [formData, setFormData] = useState({
    description: 'Sistema di autenticazione completo con login, registrazione e reset password',
    language: 'it',
    complexity: 'medium',
    template: 'auth',
    includeTests: true
  })

  // Hook avanzato con tutte le funzionalità
  const advancedHook = useFeatureGenerator({
    onSuccess: (result, duration, fromCache) => {
      console.log('✅ Advanced Hook - Successo:', {
        name: result.data?.feature?.name,
        duration: `${duration}ms`,
        fromCache
      })
    },
    onError: (error, duration) => {
      console.error('❌ Advanced Hook - Errore:', {
        message: error.message,
        code: error.code,
        duration: duration ? `${duration}ms` : 'N/A'
      })
    },
    onProgress: (message, step, total) => {
      console.log(`🔄 Progress: ${message} (${step}/${total})`)
    },
    autoRetry: true,
    maxRetries: 2,
    persistData: true,
    clearErrorOnRetry: true
  })

  // Hook semplice per casi basilari
  const simpleHook = useSimpleFeatureGenerator({
    onSuccess: (result) => {
      console.log('✅ Simple Hook - Successo:', result.data?.feature?.name)
    },
    onError: (error) => {
      console.error('❌ Simple Hook - Errore:', error.message)
    }
  })

  // Hook con cache per performance
  const cacheHook = useFeatureGeneratorWithCache({
    enableCache: true,
    enablePersistence: true,
    cacheTimeout: 10 * 60 * 1000, // 10 minuti
    onSuccess: (result, duration, fromCache) => {
      console.log('✅ Cache Hook - Successo:', {
        name: result.data?.feature?.name,
        fromCache,
        duration: fromCache ? '0ms (cache)' : `${duration}ms`
      })
    },
    onCacheHit: (data, source) => {
      console.log('🎯 Cache Hit:', { source, name: data.data?.feature?.name })
    }
  })

  // Seleziona hook attivo
  const getCurrentHook = () => {
    switch (activeHook) {
      case 'advanced': return advancedHook
      case 'simple': return simpleHook
      case 'cache': return cacheHook
      default: return advancedHook
    }
  }

  const currentHook = getCurrentHook()

  const handleGenerate = async () => {
    try {
      await currentHook.generateFeature(formData)
    } catch (error) {
      console.log('Errore gestito dal hook:', error.message)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderHookSelector = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Seleziona Hook da Testare</h3>
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveHook('advanced')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeHook === 'advanced'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Advanced Hook
        </button>
        <button
          onClick={() => setActiveHook('simple')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeHook === 'simple'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Simple Hook
        </button>
        <button
          onClick={() => setActiveHook('cache')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeHook === 'cache'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Cache Hook
        </button>
      </div>
    </div>
  )

  const renderHookInfo = () => {
    const info = {
      advanced: {
        title: 'Advanced Hook',
        description: 'Hook completo con retry automatico, progress tracking, gestione stati avanzata',
        features: [
          'Retry automatico con backoff esponenziale',
          'Progress tracking dettagliato',
          'Gestione stati derivati',
          'Persistenza dati durante reload',
          'Cancellazione richieste',
          'Metriche performance'
        ]
      },
      simple: {
        title: 'Simple Hook',
        description: 'Hook leggero per casi d\'uso basilari con gestione essenziale',
        features: [
          'Gestione loading/error/data',
          'Cancellazione richieste',
          'Reset stato',
          'Callbacks successo/errore',
          'Footprint minimo'
        ]
      },
      cache: {
        title: 'Cache Hook',
        description: 'Hook con cache in memoria e localStorage per performance ottimali',
        features: [
          'Cache in memoria con TTL',
          'Persistenza localStorage',
          'Cache hit/miss tracking',
          'Invalidazione cache',
          'Statistiche cache',
          'Pulizia automatica'
        ]
      }
    }

    const current = info[activeHook]

    return (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">{current.title}</h3>
        <p className="text-blue-800 mb-3">{current.description}</p>
        <div className="text-sm text-blue-700">
          <strong>Caratteristiche:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            {current.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const renderAdvancedStats = () => {
    if (activeHook !== 'advanced') return null

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">Stato</div>
          <div className="font-medium">
            {advancedHook.isLoading ? '🔄 Loading' :
             advancedHook.isError ? '❌ Error' :
             advancedHook.isSuccess ? '✅ Success' : '⭕ Idle'}
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">Retry</div>
          <div className="font-medium">
            {advancedHook.retryCount}/{advancedHook.retriesRemaining + advancedHook.retryCount}
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">Durata</div>
          <div className="font-medium">
            {advancedHook.lastDuration ? `${advancedHook.lastDuration}ms` : 'N/A'}
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">Progress</div>
          <div className="font-medium">
            {advancedHook.progressPercentage}%
          </div>
        </div>
      </div>
    )
  }

  const renderCacheStats = () => {
    if (activeHook !== 'cache') return null

    return (
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-2">Cache Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-purple-600">Memory Cache:</span>
            <div className="font-medium">{cacheHook.cacheStats.memorySize} items</div>
          </div>
          <div>
            <span className="text-purple-600">Storage:</span>
            <div className="font-medium">
              {cacheHook.cacheStats.hasStorageData ? '✅ Present' : '❌ Empty'}
            </div>
          </div>
          <div>
            <span className="text-purple-600">From Cache:</span>
            <div className="font-medium">
              {cacheHook.fromCache ? '🎯 Yes' : '🌐 No'}
            </div>
          </div>
          <div>
            <span className="text-purple-600">Cache Age:</span>
            <div className="font-medium">
              {cacheHook.cacheStats.cacheAge 
                ? `${Math.round(cacheHook.cacheStats.cacheAge / 1000)}s`
                : 'N/A'
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Hook Migliorati - Test & Confronto
        </h1>

        {renderHookSelector()}
        {renderHookInfo()}
        {renderAdvancedStats()}
        {renderCacheStats()}

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione Feature
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={currentHook.loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lingua
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={currentHook.loading}
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complessità
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => handleInputChange('complexity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={currentHook.loading}
              >
                <option value="simple">Semplice</option>
                <option value="medium">Media</option>
                <option value="complex">Complessa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={formData.template}
                onChange={(e) => handleInputChange('template', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={currentHook.loading}
              >
                <option value="">Nessuno</option>
                <option value="crud">CRUD</option>
                <option value="auth">Auth</option>
                <option value="ecommerce">E-commerce</option>
                <option value="api">API</option>
                <option value="dashboard">Dashboard</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeTests}
                  onChange={(e) => handleInputChange('includeTests', e.target.checked)}
                  className="mr-2"
                  disabled={currentHook.loading}
                />
                <span className="text-sm">Include Tests</span>
              </label>
            </div>
          </div>
        </div>

        {/* Controlli */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleGenerate}
            disabled={currentHook.loading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {currentHook.loading ? 'Generazione...' : 'Genera Feature'}
          </button>

          {currentHook.loading && (
            <button
              onClick={currentHook.cancel}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
            >
              Annulla
            </button>
          )}

          {currentHook.canRetry && (
            <button
              onClick={currentHook.retry}
              className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700"
            >
              Riprova
            </button>
          )}

          <button
            onClick={currentHook.reset}
            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700"
          >
            Reset
          </button>

          {activeHook === 'cache' && (
            <button
              onClick={cacheHook.clearCache}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700"
            >
              Clear Cache
            </button>
          )}
        </div>

        {/* Progress */}
        {currentHook.loading && currentHook.progress && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900">
                  {currentHook.progress}
                </div>
                {activeHook === 'advanced' && (
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentHook.progressPercentage}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Errore */}
        {currentHook.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Errore</h4>
            <p className="text-sm text-red-700">{currentHook.error.message}</p>
            {currentHook.error.code && (
              <p className="text-xs text-red-600 mt-1">Codice: {currentHook.error.code}</p>
            )}
          </div>
        )}

        {/* Risultato */}
        {currentHook.data && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              ✅ Feature Generata {currentHook.fromCache && '(da cache)'}
            </h4>
            <div className="text-sm text-green-700">
              <p><strong>Nome:</strong> {currentHook.data.data?.feature?.name}</p>
              <p><strong>Complessità:</strong> {currentHook.data.data?.feature?.complexity}</p>
              <p><strong>Stima ore:</strong> {currentHook.data.data?.feature?.estimatedHours}h</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}