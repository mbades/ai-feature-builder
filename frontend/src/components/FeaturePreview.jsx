import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function FeaturePreview() {
  const { state } = useApp()
  const { generatedFeature } = state
  const [activeSection, setActiveSection] = useState('overview')

  if (!generatedFeature) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nessuna feature generata</p>
      </div>
    )
  }

  const sections = [
    { id: 'overview', label: 'Panoramica', icon: '📋' },
    { id: 'requirements', label: 'Requisiti', icon: '✅' },
    { id: 'api', label: 'API Endpoints', icon: '🔌' },
    { id: 'data', label: 'Modelli Dati', icon: '🗃️' },
    { id: 'dependencies', label: 'Dipendenze', icon: '📦' },
    { id: 'tests', label: 'Test Cases', icon: '🧪' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Informazioni Generali</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Nome:</span>
              <p className="text-gray-900">{generatedFeature.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Complessità:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                generatedFeature.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                generatedFeature.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {generatedFeature.complexity === 'simple' ? 'Semplice' :
                 generatedFeature.complexity === 'medium' ? 'Media' : 'Complessa'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Stima ore:</span>
              <p className="text-gray-900">{generatedFeature.estimatedHours}h</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-2">Descrizione</h4>
        <p className="text-gray-700 leading-relaxed">{generatedFeature.description}</p>
      </div>
    </div>
  )

  const renderRequirements = () => (
    <div className="space-y-6">
      {/* Functional Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisiti Funzionali</h3>
        <div className="space-y-3">
          {generatedFeature.functionalRequirements?.map((req, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-mono text-gray-500">{req.id}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      req.priority === 'high' ? 'bg-red-100 text-red-800' :
                      req.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {req.priority === 'high' ? 'Alta' :
                       req.priority === 'medium' ? 'Media' : 'Bassa'}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{req.title}</h4>
                  <p className="text-gray-700 text-sm">{req.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Functional Requirements */}
      {generatedFeature.nonFunctionalRequirements?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisiti Non Funzionali</h3>
          <div className="space-y-3">
            {generatedFeature.nonFunctionalRequirements.map((req, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-mono text-gray-500">{req.id}</span>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {req.category}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{req.requirement}</h4>
                <p className="text-gray-700 text-sm">{req.metric}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderApiEndpoints = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">API Endpoints</h3>
      {generatedFeature.apiEndpoints?.map((endpoint, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <span className={`px-2 py-1 text-xs font-mono font-bold rounded ${
              endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
              endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
              endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
              endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {endpoint.method}
            </span>
            <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
          </div>
          
          <p className="text-gray-700 mb-3">{endpoint.description}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {endpoint.requestBody && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Request Body</h5>
                <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                  {JSON.stringify(endpoint.requestBody, null, 2)}
                </pre>
              </div>
            )}
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Response Body</h5>
              <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                {JSON.stringify(endpoint.responseBody, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="mt-3">
            <span className="text-sm font-medium text-gray-600">Status Codes: </span>
            <span className="text-sm text-gray-900">{endpoint.statusCodes?.join(', ')}</span>
          </div>
        </div>
      ))}
    </div>
  )

  const renderDataModels = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Modelli Dati</h3>
      {generatedFeature.dataModels?.map((model, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">{model.name}</h4>
          <p className="text-gray-700 text-sm mb-4">{model.description}</p>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Campi</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Nome</th>
                      <th className="text-left py-2 font-medium text-gray-900">Tipo</th>
                      <th className="text-left py-2 font-medium text-gray-900">Richiesto</th>
                      <th className="text-left py-2 font-medium text-gray-900">Descrizione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.fields?.map((field, fieldIndex) => (
                      <tr key={fieldIndex} className="border-b border-gray-100">
                        <td className="py-2 font-mono text-gray-900">{field.name}</td>
                        <td className="py-2 text-gray-700">{field.type}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            field.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {field.required ? 'Sì' : 'No'}
                          </span>
                        </td>
                        <td className="py-2 text-gray-700">{field.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {model.relationships?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Relazioni</h5>
                <div className="space-y-2">
                  {model.relationships.map((rel, relIndex) => (
                    <div key={relIndex} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{rel.type}</span>
                        <span className="text-sm text-gray-600">con</span>
                        <span className="text-sm font-mono text-gray-900">{rel.target}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{rel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderDependencies = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Dipendenze</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {generatedFeature.dependencies?.map((dep, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{dep.name}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                dep.type === 'library' ? 'bg-blue-100 text-blue-800' :
                dep.type === 'service' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {dep.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Versione: {dep.version}</p>
            <p className="text-sm text-gray-700">{dep.purpose}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTests = () => (
    <div className="space-y-6">
      {/* Acceptance Criteria */}
      {generatedFeature.acceptanceCriteria?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Criteri di Accettazione</h3>
          <div className="space-y-3">
            {generatedFeature.acceptanceCriteria.map((criteria, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{criteria.scenario}</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-gray-600">Dato che:</span> {criteria.given}</div>
                  <div><span className="font-medium text-gray-600">Quando:</span> {criteria.when}</div>
                  <div><span className="font-medium text-gray-600">Allora:</span> {criteria.then}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Cases */}
      {generatedFeature.testCases?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Casi di Test</h3>
          <div className="space-y-3">
            {generatedFeature.testCases.map((testCase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    testCase.type === 'unit' ? 'bg-green-100 text-green-800' :
                    testCase.type === 'integration' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {testCase.type}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">{testCase.description}</h4>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Passi:</h5>
                  <ol className="text-sm text-gray-700 space-y-1">
                    {testCase.steps?.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex">
                        <span className="mr-2">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview()
      case 'requirements': return renderRequirements()
      case 'api': return renderApiEndpoints()
      case 'data': return renderDataModels()
      case 'dependencies': return renderDependencies()
      case 'tests': return renderTests()
      default: return renderOverview()
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Section Navigation */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}