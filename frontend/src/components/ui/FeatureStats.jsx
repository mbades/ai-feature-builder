import { memo } from 'react'

/**
 * Componente Feature Stats riutilizzabile
 * Memoizzato per performance ottimali
 */
const FeatureStats = memo(function FeatureStats({ 
  feature,
  className = '' 
}) {
  if (!feature) return null

  const stats = [
    {
      label: 'Complessità',
      value: feature.complexity || 'N/A'
    },
    {
      label: 'Stima Ore',
      value: feature.estimatedHours ? `${feature.estimatedHours}h` : 'N/A'
    },
    {
      label: 'Requisiti',
      value: feature.functionalRequirements?.length || 0
    },
    {
      label: 'API Endpoints',
      value: feature.apiEndpoints?.length || 0
    }
  ]

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500">{stat.label}</div>
          <div className="font-medium text-gray-900">{stat.value}</div>
        </div>
      ))}
    </div>
  )
})

export default FeatureStats