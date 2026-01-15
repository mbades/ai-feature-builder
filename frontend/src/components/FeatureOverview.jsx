export default function FeatureOverview({ data }) {
  if (!data?.data?.feature) return null

  const feature = data.data.feature

  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎯 {feature.metadata?.name || 'Feature Generata'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {feature.metadata?.description}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {feature.metadata?.estimatedHours || 0}h
          </div>
          <div className="text-sm text-gray-500">Stima sviluppo</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getComplexityColor(feature.metadata?.complexity)}`}>
            {feature.metadata?.complexity || 'N/A'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Complessità</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {feature.requirements?.functional?.length || 0}
          </div>
          <div className="text-sm text-gray-500">Requisiti</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {feature.architecture?.apiEndpoints?.length || 0}
          </div>
          <div className="text-sm text-gray-500">API Endpoints</div>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Requirements Preview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-blue-500">🎯</span>
            Requisiti Principali
          </h3>
          <div className="space-y-3">
            {feature.requirements?.functional?.slice(0, 3).map((req, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{req.title}</div>
                  <div className="text-gray-600 text-xs mt-1">{req.description}</div>
                </div>
              </div>
            ))}
            {feature.requirements?.functional?.length > 3 && (
              <div className="text-sm text-gray-500 italic">
                +{feature.requirements.functional.length - 3} altri requisiti...
              </div>
            )}
          </div>
        </div>

        {/* Architecture Preview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-green-500">🏗️</span>
            Architettura
          </h3>
          <div className="space-y-3">
            {feature.architecture?.apiEndpoints?.slice(0, 3).map((endpoint, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-mono rounded ${
                  endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                  endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {endpoint.method}
                </span>
                <div className="flex-1">
                  <div className="font-mono text-sm text-gray-900">{endpoint.path}</div>
                  <div className="text-gray-600 text-xs">{endpoint.description}</div>
                </div>
              </div>
            ))}
            {feature.architecture?.apiEndpoints?.length > 3 && (
              <div className="text-sm text-gray-500 italic">
                +{feature.architecture.apiEndpoints.length - 3} altri endpoint...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {feature.metadata?.tags && feature.metadata.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {feature.metadata.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}