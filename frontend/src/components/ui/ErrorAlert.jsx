import { memo } from 'react'

/**
 * Componente Error Alert riutilizzabile
 * Memoizzato per performance ottimali
 */
const ErrorAlert = memo(function ErrorAlert({ 
  error, 
  title = 'Errore',
  onRetry = null,
  onDismiss = null,
  className = '' 
}) {
  if (!error) return null

  const getErrorIcon = () => (
    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )

  const getErrorTitle = () => {
    if (error.code === 'VALIDATION_ERROR') return 'Errore di Validazione'
    if (error.code === 'NETWORK_ERROR') return 'Errore di Connessione'
    if (error.code === 'REQUEST_TIMEOUT') return 'Timeout'
    return title
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`} role="alert">
      <div className="flex items-start space-x-3">
        {getErrorIcon()}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {getErrorTitle()}
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {error.message}
          </p>
          {error.code && (
            <p className="text-xs text-red-600 mt-1 font-mono">
              Codice: {error.code}
            </p>
          )}
          {error.details && Array.isArray(error.details) && (
            <div className="mt-2">
              <p className="text-xs font-medium text-red-800">Dettagli:</p>
              <ul className="text-xs text-red-700 list-disc list-inside mt-1">
                {error.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Actions */}
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1.5 rounded-md hover:bg-red-200 transition-colors"
                >
                  Riprova
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-red-600 hover:text-red-800 px-2 py-1.5"
                >
                  Chiudi
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default ErrorAlert