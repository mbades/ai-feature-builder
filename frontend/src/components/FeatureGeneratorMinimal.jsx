import { useState, useCallback } from 'react'
// import { motion } from 'framer-motion' // Temporaneamente disabilitato
import useFeatureGeneration from '../hooks/useFeatureGeneration'
import { useRotatingExamples } from '../hooks/useRotatingExamples'
import { useInputAnalysis } from '../hooks/useInputAnalysis'
import { validateDescription } from '../utils/validation'
import { API_CONFIG } from '../config/api'
import { useLoading } from '../context/LoadingContext'

// UI Components
import ExampleSuggestions from './ui/ExampleSuggestions'
import SmartPromptBuilder from './ui/SmartPromptBuilder'
import ProgressFeedback from './ui/ProgressFeedback'
import TabView, { Tab } from './ui/TabView'
import FeatureOverview from './FeatureOverview'
import RequirementsList from './RequirementsList'
import FeatureExport from './FeatureExport'
import ProjectIntegration from './ProjectIntegration'

/**
 * Componente minimal e mobile-first per generazione feature - VERSIONE MIGLIORATA
 */
export default function FeatureGeneratorMinimal() {
  const [description, setDescription] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [showPromptBuilder, setShowPromptBuilder] = useState(false)
  const { showLoading, hideLoading } = useLoading()

  // Hooks personalizzati
  const { currentExample } = useRotatingExamples(4000) // Cambia ogni 4 secondi
  const analysis = useInputAnalysis(description)

  const {
    loading,
    data,
    error,
    generateFeature,
    reset
  } = useFeatureGeneration()

  const validation = validateDescription(description)
  const isValid = validation.isValid // Torniamo alla validazione originale
  const charCount = description.length
  const charLimit = API_CONFIG.MAX_DESCRIPTION_LENGTH

  const handleSelectExample = useCallback((example) => {
    if (example && typeof example === 'string') {
      setDescription(example)
    }
  }, [])

  const handleAddText = useCallback((text) => {
    if (text && typeof text === 'string') {
      setDescription(prev => prev + text)
    }
  }, [])

  const handleReplaceText = useCallback((text) => {
    if (text && typeof text === 'string') {
      setDescription(text)
      setShowPromptBuilder(false) // Chiudi il builder dopo aver sostituito
    }
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!isValid) return

    try {
      // Mostra loading full screen
      showLoading('🤖 AI sta generando la tua specifica...')
      
      await generateFeature({
        description: validation.sanitized,
        language: 'it',
        complexity: 'medium',
        includeTests: false
      })
      
      setShowResult(true)
    } catch (err) {
      // Error handled by hook
    } finally {
      // Nascondi loading
      hideLoading()
    }
  }, [description, isValid, validation, generateFeature, showLoading, hideLoading])

  const handleReset = useCallback(() => {
    reset()
    setDescription('')
    setShowResult(false)
  }, [reset])

  const handleCopy = useCallback(async () => {
    if (!data) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      alert('✅ JSON copiato negli appunti!')
    } catch (err) {
      alert('❌ Errore nella copia')
    }
  }, [data])

  return (
    <div className="w-full">
      {/* Form Section - Google style MIGLIORATO */}
      {!showResult && (
        <div className="w-full">
          {/* Esempi Suggeriti */}
          <ExampleSuggestions
            currentExample={currentExample}
            onSelectExample={handleSelectExample}
          />

          {/* Smart Prompt Builder - Toggle */}
          <div className="text-center mb-4">
            <button
              onClick={() => setShowPromptBuilder(!showPromptBuilder)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                showPromptBuilder 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showPromptBuilder ? '🔽 Nascondi Assistente' : '🧩 Assistente Prompt'}
            </button>
          </div>

          {/* Smart Prompt Builder */}
          {showPromptBuilder && (
            <div className="mb-6">
              <SmartPromptBuilder
                currentText={description}
                onAddText={handleAddText}
                onReplaceText={handleReplaceText}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Textarea centrale - stile Google Search MIGLIORATA */}
            <div className="w-full">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Es: ${currentExample}`}
                rows={6}
                className={`w-full px-6 py-4 text-lg border-2 rounded-3xl focus:outline-none focus:ring-0 transition-all resize-none shadow-sm hover:shadow-md ${
                  validation.errors.length > 0
                    ? 'border-red-300 focus:border-red-500'
                    : analysis.quality === 'excellent'
                    ? 'border-green-300 focus:border-green-500'
                    : analysis.quality === 'good'
                    ? 'border-blue-300 focus:border-blue-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={loading}
                maxLength={charLimit + 100}
                style={{
                  minHeight: '120px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              
              {/* Feedback Progressivo */}
              <ProgressFeedback analysis={analysis} />

              {/* Character count - minimal */}
              <div className="text-center mt-2">
                <div className={`text-sm ${
                  charCount > charLimit ? 'text-red-500' :
                  charCount < API_CONFIG.MIN_DESCRIPTION_LENGTH ? 'text-gray-400' :
                  'text-green-500'
                }`}>
                  {charCount}/{charLimit}
                </div>
              </div>

              {/* Validation errors - minimal */}
              {validation.errors.length > 0 && (
                <div className="text-center mt-2">
                  {validation.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-500">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Submit button - Google style MIGLIORATI */}
            <div className="text-center space-x-4">
              <button
                type="submit"
                disabled={loading || !isValid}
                className={`px-8 py-3 text-base font-medium rounded-full transition-all shadow-sm hover:shadow-md transform hover:scale-105 ${
                  isValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ✨ Genera Specifica
              </button>
              
              <button
                type="button"
                disabled={loading || !isValid}
                onClick={() => {
                  handleSubmit({
                    preventDefault: () => {},
                    target: {
                      description: { value: description }
                    }
                  })
                }}
                className={`px-8 py-3 text-base font-medium rounded-full transition-all shadow-sm hover:shadow-md transform hover:scale-105 ${
                  isValid
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                🎲 Sorprendimi
              </button>
            </div>

            {/* Error message - minimal */}
            {error && (
              <div className="text-center">
                <p className="text-sm text-red-600">
                  ❌ {error.message || 'Si è verificato un errore'}
                </p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Result Section - TabView migliorata */}
      {showResult && data && (
        <div className="w-full space-y-8">
          {/* Success message - minimal */}
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-normal text-gray-900 mb-2">
              Specifica Generata!
            </h2>
            <p className="text-lg text-gray-600">
              {data.data?.feature?.metadata?.name}
            </p>
          </div>

          {/* TabView per risultati user-friendly */}
          <TabView defaultTab={0}>
            <Tab label="📋 Panoramica">
              <FeatureOverview data={data} />
            </Tab>
            <Tab label="🎯 Requisiti">
              <RequirementsList data={data} />
            </Tab>
            <Tab label="🚀 Esporta">
              <FeatureExport data={data} />
            </Tab>
            <Tab label="🔗 Integra">
              <ProjectIntegration data={data} />
            </Tab>
            <Tab label="🔧 JSON">
              <div className="bg-gray-50 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Specifica Completa (JSON)
                  </h3>
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Copia JSON
                  </button>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            </Tab>
          </TabView>

          {/* Action buttons - Google style MIGLIORATI */}
          <div className="text-center space-x-4 pt-8">
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-all shadow-sm hover:shadow-md transform hover:scale-105"
            >
              🔄 Nuova Feature
            </button>
            <button
              onClick={handleCopy}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-sm hover:shadow-md transform hover:scale-105"
            >
              📋 Copia JSON
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
