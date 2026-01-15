import React, { useState } from 'react'
import { useFeatureGeneration, useAiHealthCheck } from '../hooks/useFeatureApi'

/**
 * Componente di esempio per dimostrare l'uso del modulo Feature API
 */
export default function FeatureApiExample() {
  const [formData, setFormData] = useState({
    description: '',
    language: 'it',
    complexity: 'medium',
    template: '',
    includeTests: false
  })

  // Hook per generazione feature con gestione completa
  const {
    loading,
    data,
    error,
    progress,
    requestId,
    retryCount,
    generateFeature,
    reset,
    cancel,
    retry,
    canRetry,
    isRetrying
  } = useFeatureGeneration({
    onSuccess: (result) => {
      console.log('✅ Feature generata con successo:', result)
    },
    onError: (error) => {
      console.error('❌ Errore nella generazione:', error)
    },
    onStart: (data) => {
      console.log('🚀 Inizio generazione per:', data.description.substring(0, 50) + '...')
    },
    autoRetry: true,
    maxRetries: 2
  })

  // Hook per controllo stato AI
  const { 
    healthy, 
    lastCheck, 
    checkHealth,
    startPeriodicCheck,
    stopPeriodicCheck 
  } = useAiHealthCheck({
    immediate: true,
    interval: 30000
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await generateFeature(formData)
    } catch (error) {
      // Errore già gestito dal hook
      console.log('Errore catturato dal componente:', error.message)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Feature API - Esempio di Utilizzo
        </h1>

        {/* Stato AI Service */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                healthy === null ? 'bg-gray-400' :
                healthy ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                Stato AI Service: {
                  healthy === null ? 'Controllo...' :
                  healthy ? 'Operativo' : 'Non disponibile'
                }
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={checkHealth}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
              >
                Verifica
              </button>
              <button
                onClick={startPeriodicCheck}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
              >
                Auto-check
              </button>
              <button
                onClick={stopPeriodicCheck}
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
              >
                Stop
              </button>
            </div>
          </div>
          {lastCheck && (
            <p className="text-xs text-gray-500 mt-1">
              Ultimo controllo: {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Form di esempio */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione Feature *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrivi la feature che vuoi generare..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 caratteri
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lingua
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              >
                <option value="">Nessun template</option>
                <option value="crud">CRUD</option>
                <option value="auth">Authentication</option>
                <option value="ecommerce">E-commerce</option>
                <option value="api">REST API</option>
                <option value="dashboard">Dashboard</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeTests"
              checked={formData.includeTests}
              onChange={(e) => handleInputChange('includeTests', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="includeTests" className="ml-2 text-sm text-gray-700">
              Includi test cases dettagliati
            </label>
          </div>

          {/* Controlli */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || !formData.description.trim()}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generazione...' : 'Genera Feature'}
            </button>

            {loading && (
              <button
                type="button"
                onClick={cancel}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
              >
                Annulla
              </button>
            )}

            {canRetry && (
              <button
                type="button"
                onClick={() => retry(formData)}
                className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700"
              >
                Riprova
              </button>
            )}

            {(data || error) && (
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Stato e Progress */}
        {loading && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {progress || 'Elaborazione in corso...'}
                </p>
                {isRetrying && (
                  <p className="text-xs text-blue-700">
                    Tentativo {retryCount + 1} in corso...
                  </p>
                )}
                {requestId && (
                  <p className="text-xs text-blue-600 font-mono">
                    ID: {requestId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Errore */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">
                  Errore nella generazione
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {error.message}
                </p>
                {error.details && (
                  <div className="mt-2 text-xs text-red-600">
                    <strong>Dettagli:</strong>
                    {Array.isArray(error.details) ? (
                      <ul className="list-disc list-inside mt-1">
                        {error.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{error.details}</p>
                    )}
                  </div>
                )}
                {error.requestId && (
                  <p className="text-xs text-red-600 font-mono mt-1">
                    Request ID: {error.requestId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Risultato */}
        {data && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              ✅ Feature generata con successo!
            </h4>
            <div className="text-sm text-green-700">
              <p><strong>Nome:</strong> {data.data?.feature?.name}</p>
              <p><strong>Complessità:</strong> {data.data?.feature?.complexity}</p>
              <p><strong>Stima ore:</strong> {data.data?.feature?.estimatedHours}h</p>
              {data._metadata && (
                <div className="mt-2 text-xs text-green-600">
                  <p>Tempo elaborazione: {data._metadata.duration}ms</p>
                  <p>Request ID: {data._metadata.requestId}</p>
                </div>
              )}
            </div>
            
            {/* Preview JSON */}
            <details className="mt-3">
              <summary className="text-xs text-green-700 cursor-pointer hover:text-green-800">
                Mostra JSON completo
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}