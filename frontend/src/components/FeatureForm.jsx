import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useFeatureGeneration } from '../hooks/useApi'
import LoadingSpinner from './LoadingSpinner'

export default function FeatureForm() {
  const { state, actions } = useApp()
  const { formData } = state
  const featureGeneration = useFeatureGeneration()
  
  const [validationErrors, setValidationErrors] = useState({})

  // Validate form data
  const validateForm = () => {
    const errors = {}
    
    if (!formData.description.trim()) {
      errors.description = 'La descrizione è obbligatoria'
    } else if (formData.description.length < 10) {
      errors.description = 'La descrizione deve essere di almeno 10 caratteri'
    } else if (formData.description.length > 2000) {
      errors.description = 'La descrizione non può superare i 2000 caratteri'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      // Generate request ID for tracking
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Start generation
      actions.generateStart(requestId)
      
      // Prepare request data
      const requestData = {
        description: formData.description.trim(),
        language: formData.language,
        complexity: formData.complexity,
        includeTests: formData.includeTests
      }

      // Add template if selected
      if (formData.template) {
        requestData.template = formData.template
      }

      // Add to request history
      actions.addRequestHistory({
        id: requestId,
        timestamp: new Date().toISOString(),
        data: requestData
      })

      // Call API
      const result = await featureGeneration.execute(requestData)
      
      // Handle success
      actions.generateSuccess(result)
      
    } catch (error) {
      // Handle error
      actions.generateError(error)
    }
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    actions.updateFormData({ [field]: value })
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Descrivi la tua feature
            </h2>
            <p className="text-gray-600">
              Inserisci una descrizione dettagliata della funzionalità che vuoi sviluppare. 
              L'AI genererà una specifica tecnica completa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione della feature *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Es: Voglio creare un sistema di autenticazione utenti con login, registrazione e reset password..."
                rows={6}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.description 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                disabled={state.isGenerating}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Minimo 10 caratteri, massimo 2000</span>
                <span className={formData.description.length > 2000 ? 'text-red-600' : ''}>
                  {formData.description.length}/2000
                </span>
              </div>
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Lingua
                </label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={state.isGenerating}
                >
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Complexity */}
              <div>
                <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-2">
                  Complessità
                </label>
                <select
                  id="complexity"
                  value={formData.complexity}
                  onChange={(e) => handleInputChange('complexity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={state.isGenerating}
                >
                  <option value="simple">Semplice</option>
                  <option value="medium">Media</option>
                  <option value="complex">Complessa</option>
                </select>
              </div>

              {/* Template */}
              <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                  Template (opzionale)
                </label>
                <select
                  id="template"
                  value={formData.template}
                  onChange={(e) => handleInputChange('template', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={state.isGenerating}
                >
                  <option value="">Nessun template</option>
                  <option value="crud">CRUD Operations</option>
                  <option value="auth">Authentication</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="api">REST API</option>
                  <option value="dashboard">Dashboard</option>
                </select>
              </div>
            </div>

            {/* Include Tests Checkbox */}
            <div className="flex items-center">
              <input
                id="includeTests"
                type="checkbox"
                checked={formData.includeTests}
                onChange={(e) => handleInputChange('includeTests', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={state.isGenerating}
              />
              <label htmlFor="includeTests" className="ml-2 block text-sm text-gray-700">
                Includi casi di test dettagliati
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={state.isGenerating || !formData.description.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Generazione in corso...</span>
                  </div>
                ) : (
                  'Genera Specifica'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Suggerimenti per una descrizione efficace:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Sii specifico sui requisiti funzionali (cosa deve fare l'utente)</li>
          <li>• Includi dettagli sui dati da gestire (utenti, prodotti, ordini, ecc.)</li>
          <li>• Menziona integrazioni esterne se necessarie (pagamenti, email, ecc.)</li>
          <li>• Specifica vincoli di sicurezza o performance se importanti</li>
        </ul>
      </div>
    </div>
  )
}