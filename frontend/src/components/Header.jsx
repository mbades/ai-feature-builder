import { useApp } from '../context/AppContext'

export default function Header() {
  const { state, actions } = useApp()
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Feature Builder</h1>
              <p className="text-sm text-gray-500">Genera specifiche tecniche da descrizioni naturali</p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center space-x-4">
            {/* Generation Status */}
            {state.isGenerating && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium">Generazione in corso...</span>
              </div>
            )}

            {/* Clear Button */}
            {(state.generatedFeature || state.generationError) && (
              <button
                onClick={actions.clearGeneration}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Nuova Feature
              </button>
            )}

            {/* Reset Button */}
            <button
              onClick={actions.resetForm}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Reset completo"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {(state.generatedFeature || state.generationError || state.activeTab !== 'input') && (
          <nav className="mt-4 flex space-x-1">
            <button
              onClick={() => actions.setActiveTab('input')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                state.activeTab === 'input'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Input
            </button>
            
            {state.generatedFeature && (
              <>
                <button
                  onClick={() => actions.setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    state.activeTab === 'preview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Anteprima
                </button>
                
                <button
                  onClick={() => actions.setActiveTab('export')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    state.activeTab === 'export'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Esporta
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}