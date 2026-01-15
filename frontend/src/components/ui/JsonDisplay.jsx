import { memo } from 'react'
import { sanitizeJsonForDisplay } from '../../utils/validation'

/**
 * Componente JSON Display riutilizzabile e sicuro
 * Memoizzato per performance ottimali
 */
const JsonDisplay = memo(function JsonDisplay({ 
  data, 
  title = 'JSON Data',
  fromCache = false,
  className = '' 
}) {
  if (!data) return null

  const jsonSize = new Blob([JSON.stringify(data, null, 2)]).size

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            {title} {fromCache && '(da cache)'}
          </h4>
          <div className="text-xs text-gray-500">
            {jsonSize} bytes
          </div>
        </div>
      </div>
      <div className="p-4">
        <pre 
          className="text-sm text-gray-900 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto bg-white p-4 rounded border"
          dangerouslySetInnerHTML={{
            __html: sanitizeJsonForDisplay(data)
          }}
        />
      </div>
    </div>
  )
})

export default JsonDisplay