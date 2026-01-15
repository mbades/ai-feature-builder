import { useState } from 'react'
import FeatureGeneratorSimple from './FeatureGeneratorSimple'
import FeatureGeneratorMinimal from './FeatureGeneratorMinimal'
import FeatureGeneratorWithCache from './FeatureGeneratorWithCache'

/**
 * Componente demo che mostra tutti i generatori di feature
 * Permette di confrontare le diverse implementazioni
 */
export default function FeatureGeneratorDemo() {
  const [activeComponent, setActiveComponent] = useState('simple')

  const components = [
    {
      id: 'simple',
      name: 'Completo',
      description: 'Versione completa con progress, retry, validazione avanzata',
      component: FeatureGeneratorSimple,
      features: [
        'Progress tracking dettagliato',
        'Retry automatico',
        'Validazione avanzata',
        'Statistiche performance',
        'UI completa'
      ]
    },
    {
      id: 'minimal',
      name: 'Minimalista',
      description: 'Versione essenziale per casi d\'uso semplici',
      component: FeatureGeneratorMinimal,
      features: [
        'Interfaccia pulita',
        'Footprint minimo',
        'Funzionalità base',
        'Facile integrazione'
      ]
    },
    {
      id: 'cache',
      name: 'Con Cache',
      description: 'Versione ottimizzata con cache per performance',
      component: FeatureGeneratorWithCache,
      features: [
        'Cache intelligente',
        'Persistenza localStorage',
        'Statistiche cache',
        'Performance ottimali',
        'Esempi predefiniti'
      ]
    }
  ]

  const currentComponent = components.find(c => c.id === activeComponent)
  const ComponentToRender = currentComponent?.component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con selector */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 Feature Generator Demo
              </h1>
              <p className="text-gray-600 mt-1">
                Confronta le diverse implementazioni del generatore di feature
              </p>
            </div>

            {/* Component selector */}
            <div className="flex space-x-2">
              {components.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setActiveComponent(comp.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeComponent === comp.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Component info */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentComponent?.name} Generator
              </h2>
              <p className="text-gray-600 mb-4">
                {currentComponent?.description}
              </p>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Caratteristiche principali:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {currentComponent?.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick comparison */}
            <div className="mt-4 lg:mt-0 lg:w-80">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Confronto Rapido
                </h3>
                <div className="space-y-2 text-xs">
                  {components.map((comp) => (
                    <div
                      key={comp.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        comp.id === activeComponent
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-white text-gray-600'
                      }`}
                    >
                      <span className="font-medium">{comp.name}</span>
                      <span>
                        {comp.id === 'simple' && '🔧 Completo'}
                        {comp.id === 'minimal' && '⚡ Veloce'}
                        {comp.id === 'cache' && '🚀 Performance'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render selected component */}
      <div className="pb-12">
        {ComponentToRender && <ComponentToRender />}
      </div>

      {/* Footer con info */}
      <div className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🔧 Completo</h3>
              <p className="text-sm text-gray-600">
                Ideale per applicazioni professionali che richiedono UX avanzata, 
                retry automatico e feedback dettagliato all'utente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">⚡ Minimalista</h3>
              <p className="text-sm text-gray-600">
                Perfetto per prototipi, demo o integrazioni semplici dove serve 
                solo la funzionalità base senza fronzoli.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🚀 Con Cache</h3>
              <p className="text-sm text-gray-600">
                Ottimizzato per performance con cache intelligente. Ideale per 
                applicazioni con molte richieste ripetitive.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>
                💡 <strong>Suggerimento:</strong> Prova gli stessi input sui diversi componenti 
                per vedere le differenze di comportamento e performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}