import { memo } from 'react'

/**
 * Componente Success Alert riutilizzabile
 * Memoizzato per performance ottimali
 */
const SuccessAlert = memo(function SuccessAlert({ 
  title = 'Successo',
  message,
  duration,
  fromCache = false,
  onCopy = null,
  className = '' 
}) {
  const getSuccessIcon = () => (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  const getCacheIcon = () => (
    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
  )

  return (
    <div className={`${fromCache ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {fromCache ? getCacheIcon() : getSuccessIcon()}
          <div>
            <h3 className={`text-sm font-medium ${fromCache ? 'text-purple-800' : 'text-green-800'}`}>
              {fromCache ? '🎯 Risultato da Cache' : `✅ ${title}`}
            </h3>
            <div className={`text-sm ${fromCache ? 'text-purple-700' : 'text-green-700'}`}>
              {message && (
                <>
                  <span className="font-medium">Nome:</span> {message}
                </>
              )}
              {duration !== undefined && (
                <span className="ml-4">
                  <span className="font-medium">Tempo:</span> {fromCache ? '~0ms (cache)' : `${duration}ms`}
                </span>
              )}
            </div>
          </div>
        </div>
        {onCopy && (
          <button
            onClick={onCopy}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              fromCache 
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            📋 Copia
          </button>
        )}
      </div>
    </div>
  )
})

export default SuccessAlert