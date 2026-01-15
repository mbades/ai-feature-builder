import { useState, useCallback, useMemo } from 'react'
import { PROMPT_CATEGORIES, PROMPT_TEMPLATES } from '../../config/promptCategories'
import { usePromptSuggestions } from '../../hooks/usePromptSuggestions'
import ErrorBoundary from './ErrorBoundary'

/**
 * Smart Prompt Builder Component - Refactored for performance and maintainability
 * Helps users create perfect prompts with intelligent suggestions and templates
 */
function SmartPromptBuilderCore({ currentText, onAddText, onReplaceText }) {
  const [activeCategory, setActiveCategory] = useState('basics')
  const [isLoading, setIsLoading] = useState(false)

  // Use custom hook for suggestions logic
  const { smartSuggestions, detectedContext } = usePromptSuggestions(currentText)

  // Memoize categories to prevent unnecessary re-renders
  const categories = useMemo(() => PROMPT_CATEGORIES, [])
  const templates = useMemo(() => PROMPT_TEMPLATES, [])

  // Memoized handlers with proper error handling
  const handleChipClick = useCallback(async (chipText) => {
    if (!chipText || typeof chipText !== 'string') {
      console.warn('Invalid chip text provided')
      return
    }

    try {
      setIsLoading(true)
      
      // Add space if necessary
      const textToAdd = currentText && currentText.length > 0 && !currentText.endsWith(' ') 
        ? ` ${chipText}` 
        : chipText
      
      await onAddText(textToAdd)
    } catch (error) {
      console.error('Error adding text:', error)
      // Could show a toast notification here
    } finally {
      setIsLoading(false)
    }
  }, [currentText, onAddText])

  const handleTemplateSelect = useCallback(async (template) => {
    if (!template || typeof template !== 'string') {
      console.warn('Invalid template provided')
      return
    }

    try {
      setIsLoading(true)
      await onReplaceText(template)
    } catch (error) {
      console.error('Error replacing text:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onReplaceText])

  const handleCategoryChange = useCallback((categoryKey) => {
    if (categories[categoryKey]) {
      setActiveCategory(categoryKey)
    }
  }, [categories])

  // Memoized active category data
  const activeCategoryData = useMemo(() => {
    return categories[activeCategory] || categories.basics
  }, [categories, activeCategory])

  return (
    <div className="space-y-4" role="region" aria-label="Assistente per la creazione di prompt">
      {/* Smart Suggestions - Dynamic based on input */}
      {smartSuggestions.length > 0 && (
        <div className="space-y-3" role="region" aria-label="Suggerimenti intelligenti">
          {smartSuggestions.map((suggestion, index) => (
            <div 
              key={`${suggestion.type}-${index}`} 
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden="true">
                  {suggestion.title.split(' ')[0]}
                </span>
                <h4 className="font-medium text-gray-900">
                  {suggestion.title.substring(2)}
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {suggestion.description}
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Suggerimenti rapidi">
                {suggestion.chips.map((chip, chipIndex) => (
                  <button
                    key={`${suggestion.type}-chip-${chipIndex}`}
                    onClick={() => handleChipClick(chip.text)}
                    disabled={isLoading}
                    className="group px-3 py-1.5 bg-white border border-blue-200 rounded-full hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title={chip.description}
                    aria-label={`Aggiungi "${chip.text}" al prompt`}
                  >
                    <span className="text-gray-700 group-hover:text-blue-700">
                      {chip.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">
            🧩 Costruisci il prompt perfetto
          </h3>
          <p className="text-sm text-gray-600">
            Clicca per aggiungere elementi al tuo prompt
          </p>
        </div>

        {/* Category Tabs */}
        <div 
          className="flex overflow-x-auto border-b border-gray-200" 
          role="tablist" 
          aria-label="Categorie di suggerimenti"
        >
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              role="tab"
              aria-selected={activeCategory === key}
              aria-controls={`category-panel-${key}`}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                activeCategory === key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${detectedContext.includes(key) ? 'bg-yellow-50 text-yellow-700' : ''}`}
            >
              {category.label}
              {detectedContext.includes(key) && (
                <span 
                  className="ml-1 w-2 h-2 bg-yellow-400 rounded-full inline-block" 
                  aria-label="Categoria rilevata nel testo"
                />
              )}
            </button>
          ))}
        </div>

        {/* Active Category Chips */}
        <div 
          className="p-4" 
          role="tabpanel" 
          id={`category-panel-${activeCategory}`}
          aria-labelledby={`category-tab-${activeCategory}`}
        >
          <div className="flex flex-wrap gap-2" role="group" aria-label={`Opzioni per ${activeCategoryData.label}`}>
            {activeCategoryData.chips.map((chip, index) => (
              <button
                key={`${activeCategory}-${index}`}
                onClick={() => handleChipClick(chip.text)}
                disabled={isLoading}
                className="group px-3 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title={chip.description}
                aria-label={`Aggiungi "${chip.text}" al prompt`}
              >
                <span className="text-gray-700 group-hover:text-blue-700">
                  + {chip.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">
            📋 Template completi
          </h3>
          <p className="text-sm text-gray-600">
            Sostituisci tutto il prompt con un template
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Template disponibili">
            {templates.map((template, index) => (
              <button
                key={`template-${index}`}
                onClick={() => handleTemplateSelect(template.template)}
                disabled={isLoading}
                className="text-left p-3 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`Usa template: ${template.title}`}
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-700 mb-1">
                  {template.title}
                </div>
                <div className="text-xs text-gray-600 line-clamp-2">
                  {template.template.substring(0, 80)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-2" role="status" aria-live="polite">
          <span className="text-sm text-gray-500">Aggiornamento in corso...</span>
        </div>
      )}
    </div>
  )
}

/**
 * Wrapped component with Error Boundary for better error handling
 */
export default function SmartPromptBuilder(props) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm text-yellow-800">
            L'assistente prompt non è disponibile al momento. 
            Puoi continuare a scrivere il prompt manualmente.
          </p>
        </div>
      }
      errorMessage="Errore nell'assistente prompt"
    >
      <SmartPromptBuilderCore {...props} />
    </ErrorBoundary>
  )
}