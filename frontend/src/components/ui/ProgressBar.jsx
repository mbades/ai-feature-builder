import { memo } from 'react'

/**
 * Componente Progress Bar riutilizzabile
 * Memoizzato per performance ottimali
 */
const ProgressBar = memo(function ProgressBar({ 
  progress, 
  percentage = 0, 
  isRetrying = false, 
  retryCount = 0,
  className = '' 
}) {
  if (!progress) return null

  return (
    <div className={`bg-blue-50 rounded-lg p-4 ${className}`} role="status" aria-live="polite">
      <div className="flex items-center space-x-3 mb-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-900">
            {progress}
          </div>
          {isRetrying && (
            <div className="text-xs text-blue-700 mt-1">
              Tentativo {retryCount} in corso...
            </div>
          )}
        </div>
        <div className="text-sm font-medium text-blue-700">
          {percentage}%
        </div>
      </div>
      
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  )
})

export default ProgressBar