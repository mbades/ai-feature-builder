export default function RequirementsList({ data }) {
  if (!data?.data?.feature?.requirements) return null

  const { functional = [], nonFunctional = [] } = data.data.feature.requirements

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="space-y-8">
      {/* Functional Requirements */}
      {functional.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-blue-500">🎯</span>
            Requisiti Funzionali
          </h3>
          <div className="space-y-4">
            {functional.map((req, index) => (
              <div
                key={req.id || index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getPriorityIcon(req.priority)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {req.id}: {req.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(req.priority)}`}>
                          {req.priority || 'N/A'}
                        </span>
                        {req.category && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                            {req.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{req.description}</p>
                
                {req.dependencies && req.dependencies.length > 0 && (
                  <div className="border-t border-gray-100 pt-3">
                    <div className="text-sm text-gray-500 mb-2">Dipendenze:</div>
                    <div className="flex flex-wrap gap-1">
                      {req.dependencies.map((dep, depIndex) => (
                        <span
                          key={depIndex}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Functional Requirements */}
      {nonFunctional.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-purple-500">⚙️</span>
            Requisiti Non Funzionali
          </h3>
          <div className="space-y-4">
            {nonFunctional.map((req, index) => (
              <div
                key={req.id || index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">⚙️</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {req.id}: {req.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(req.priority)}`}>
                          {req.priority || 'N/A'}
                        </span>
                        {req.category && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                            {req.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600">{req.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {functional.length === 0 && nonFunctional.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nessun requisito trovato
          </h3>
          <p className="text-gray-500">
            I requisiti verranno mostrati qui una volta generata la specifica.
          </p>
        </div>
      )}
    </div>
  )
}