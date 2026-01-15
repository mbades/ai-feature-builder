import { useState, useCallback, useMemo } from 'react'
import useFeatureGeneration from '../hooks/useFeatureGeneration'
import { validateDescription } from '../utils/validation'
import { API_CONFIG } from '../config/api'

// Componenti UI riutilizzabili
import ProgressBar from './ui/ProgressBar'
import ErrorAlert from './ui/ErrorAlert'
import SuccessAlert from './ui/SuccessAlert'
import JsonDisplay from './ui/JsonDisplay'
import FeatureStats from './ui/FeatureStats'

/**
 * Componente unificato e ottimizzato per generazione feature
 * Consolida funzionalità di tutti i componenti precedenti
 * 
 * @param {Object} props - Proprietà componente
 * @param {string} props.variant - Variante UI ('full', 'minimal', 'cache')
 * @param {boolean} props.enableCache - Abilita cache
 * @param {boolean} props.enablePersistence - Abilita localStorage
 * @param {boolean} props.autoRetry - Abilita retry automatico
 * @param {number} props.maxRetries - Numero massimo retry
 * @param {Function} props.onSuccess - Callback successo
 * @param {Function} props.onError - Callback errore
 */
export default function FeatureGenerator({
  variant = 'full',
  enableCache = false,
  enablePersistence = false,
  autoRetry = true,
  maxRetries = 2,
  onSuccess = null,
  onError = null
}) {
  const [description, setDescription] = useState('')
  const [validationErrors, setValidationErrors] = useState([])

  // Hook unificato per generazione
  const {
    loading,
    data,
    error,
    progress,
    progressPercentage,
    generateFeature,
    reset,
    cancel,
    retry,
    clearCache,
    canRetry,
    isRetrying,
    lastDuration,
    fromCache,
    cacheStats
  } = useFeatureGeneration({
    onSuccess: (result, duration, fromCache) => {
      if (onSuccess) {
        onSuccess(result, duration, fromCache)
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error)
      }
    },
    autoRetry,
    maxRetries,
    enableCache,
    enablePersistence
  })

  // Validazione in tempo reale memoizzata
  const descriptionValidation = useMemo(() => {
    return validateDescription(description)
  }, [description])

  // Gestisce cambio descrizione con validazione
  const handleDescriptionChange = useCallback((e) => {
    const value = e.target.value
    setDescription(value)
    
    const validation = validateDescription(value)
    setValidationErrors(validation.errors)
  }, [])

  // Gestisce generazione con validazione sicura
  const handleGenerate = useCallback(async () => {
    const validation = validateDescription(description)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    try {
      await generateFeature({
        description: validation.sanitized,
        language: 'it',
        complexity: 'medium',
        includeTests: false
      })
    } catch (err) {
      // Errore già gestito dal hook
    }
  }, [description, generateFeature])

  // Reset sicuro
  const handleReset = useCallback((clearCacheData = false) => {
    reset(clearCacheData)
    setDescription('')
    setValidationErrors([])
  }, [reset])

  // Copia sicura negli appunti
  const handleCopyToClipboard = useCallback(async () => {
    if (!data) return

    try {
      const jsonString = JSON.stringify(data, null, 2)
      await navigator.clipboard.writeText(jsonString)
      
      // Feedback visivo (implementazione semplificata)
      console.log('JSON copiato negli appunti')
    } catch (err) {
      console.error('Errore copia:', err)
      alert('Errore nella copia negli appunti')
    }
  }, [data])

  // Calcola stato validazione
  const isDescriptionValid = descriptionValidation.isValid
  const characterCount = description.length
  const isOverLimit = characterCount > API_CONFIG.MAX_DESCRIPTION_LENGTH
  const isUnderLimit = characterCount < API_CONFIG.MIN_DESCRIPTION_LENGTH && characterCount > 0

  // Esempi predefiniti per variant cache
  const examples = variant === 'cache' ? [
    'Sistema di autenticazione completo con login, registrazione e reset password',
    'E-commerce con carrello, checkout, pagamenti e gestione ordini',
    'Dashboard amministrativa con grafici, tabelle e gestione utenti',
    'API REST per gestione blog con articoli, commenti e categorie'
  ] : []

  // Rendering condizionale basato su variant
  const renderHeader = () => {
    const titles = {
      full: '🚀 AI Feature Generator',
      minimal: 'Feature Generator',
      cache: '🚀 AI Feature Generator (con Cache)'
    }

    const descriptions = {
      full: 'Genera specifiche tecniche complete da descrizioni in linguaggio naturale',
      minimal: 'Genera specifiche tecniche',
      cache: 'Genera specifiche tecniche con cache intelligente per performance ottimali'
    }

    return (
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {titles[variant]}
        </h1>
        <p className="text-gray-600">
          {descriptions[variant]}
        </p>
      </div>
    )
  }

  const renderCacheStats = () => {
    if (variant !== 'cache') return null

    return (
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-sm font-medium text-purple-900 mb-2">📊 Statistiche Cache</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-purple-600">Memoria:</span>
            <div className="font-medium">{cacheStats.memorySize} items</div>
          </div>
          <div>
            <span className="text-purple-600">Storage:</span>
            <div className="font-medium">
              {cacheStats.hasStorageData ? '✅ Presente' : '❌ Vuoto'}
            </div>
          </div>
          <div>
            <span className="text-purple-600">Ultima risposta:</span>
            <div className="font-medium">
              {fromCache ? '🎯 Cache' : '🌐 Server'}
            </div>
          </div>
          <div>
            <span className="text-purple-600">Età cache:</span>
            <div className="font-medium">
              {cacheStats.cacheAge 
                ? `${Math.round(cacheStats.cacheAge / 1000)}s`
                : 'N/A'
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderExamples = () => {
    if (variant !== 'cache' || examples.length === 0) return null

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🚀 Esempi rapidi (per testare la cache)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setDescription(example)}
              className="p-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderControls = () => {
    const baseControls = (
      <>
        <button
          onClick={handleGenerate}
          disabled={loading || !isDescriptionValid}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Generazione...</span>
            </div>
          ) : (
            'Genera Specifica'
          )}
        </button>

        {loading && (
          <button
            onClick={cancel}
            className="px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Annulla
          </button>
        )}

        {canRetry && (
          <button
            onClick={retry}
            className="px-4 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
          >
            {isRetrying ? 'Nuovo tentativo...' : 'Riprova'}
          </button>
        )}

        {(data || error) && (
          <button
            onClick={() => handleReset(false)}
            className="px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        )}
      </>
    )

    const cacheControls = variant === 'cache' ? (
      <button
        onClick={clearCache}
        className="px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        title="Pulisce cache memoria e localStorage"
      >
        🗑️ Clear Cache
      </button>
    ) : null

    return (
      <div className="flex flex-wrap gap-3">
        {baseControls}
        {cacheControls}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        {variant !== 'minimal' && renderHeader()}

        <div className="p-6 space-y-6">
          {/* Cache Stats */}
          {renderCacheStats()}

          {/* Examples */}
          {renderExamples()}

          {/* Textarea */}
          <div>
            <label 
              htmlFor="feature-description" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrizione della Feature *
            </label>
            <textarea
              id="feature-description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Es: Voglio creare un sistema di autenticazione completo..."
              rows={variant === 'minimal' ? 4 : 6}
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                validationErrors.length > 0
                  ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                  : isDescriptionValid && description
                  ? 'border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={loading}
              aria-describedby="description-help description-errors"
              aria-invalid={validationErrors.length > 0}
              maxLength={API_CONFIG.MAX_DESCRIPTION_LENGTH + 100}
            />
            
            {/* Character count e validazione */}
            <div className="mt-2 flex justify-between items-start">
              <div id="description-help" className="text-sm text-gray-500">
                Minimo {API_CONFIG.MIN_DESCRIPTION_LENGTH} caratteri, massimo {API_CONFIG.MAX_DESCRIPTION_LENGTH}
              </div>
              <div className={`text-sm font-medium ${
                isOverLimit ? 'text-red-600' :
                isUnderLimit ? 'text-yellow-600' :
                isDescriptionValid ? 'text-green-600' : 'text-gray-500'
              }`}>
                {characterCount}/{API_CONFIG.MAX_DESCRIPTION_LENGTH}
              </div>
            </div>
            
            {/* Errori validazione */}
            {validationErrors.length > 0 && (
              <div id="description-errors" className="mt-2" role="alert">
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Controlli */}
          {renderControls()}

          {/* Progress Bar */}
          <ProgressBar 
            progress={progress}
            percentage={progressPercentage}
            isRetrying={isRetrying}
            retryCount={maxRetries - (maxRetries - 1)}
          />

          {/* Error Alert */}
          <ErrorAlert 
            error={error}
            onRetry={canRetry ? retry : null}
            onDismiss={() => handleReset(false)}
          />

          {/* Success Alert */}
          {data && (
            <SuccessAlert
              title="Feature generata con successo!"
              message={data.data?.feature?.name}
              duration={lastDuration}
              fromCache={fromCache}
              onCopy={handleCopyToClipboard}
            />
          )}

          {/* JSON Display */}
          {data && (
            <JsonDisplay
              data={data}
              title="Specifica Tecnica (JSON)"
              fromCache={fromCache}
            />
          )}

          {/* Feature Stats */}
          {data?.data?.feature && (
            <FeatureStats feature={data.data.feature} />
          )}
        </div>

        {/* Footer */}
        {variant !== 'minimal' && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="text-sm text-gray-600">
              <strong>🔒 Sicurezza:</strong> Tutti i dati sono validati e sanitizzati. 
              {variant === 'cache' && ' Cache intelligente per performance ottimali.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}