import { useEffect, useState } from 'react'

/**
 * Componente per overlay di loading full screen
 */
export default function LoadingOverlay({ isVisible, message = "Caricamento in corso..." }) {
  const [progress, setProgress] = useState(0)

  // Animazione progress bar
  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90 // Non arriva mai a 100 finché non finisce
        return prev + Math.random() * 10
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Overlay background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
      
      {/* Loading content */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md mx-4 text-center">
        {/* Single main spinner */}
        <div className="relative mx-auto mb-8">
          {/* Main spinner ring */}
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          
          {/* Pulsing outer glow */}
          <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-2 border-blue-300 opacity-20"></div>
        </div>

        {/* Minimal text */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {message.replace('🤖 ', '').replace('...', '')}
          </h2>
          
          <p className="text-sm text-gray-500">
            Attendere prego
          </p>
        </div>

        {/* Progress bar che ti piace */}
        <div className="mt-8 space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Generazione in corso</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Minimal animated dots */}
        <div className="flex justify-center space-x-1 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
        </div>
      </div>
    </div>
  )
}