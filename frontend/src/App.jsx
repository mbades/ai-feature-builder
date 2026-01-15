import { useState } from 'react'
import FeatureGeneratorMinimal from './components/FeatureGeneratorMinimal'
import LoadingOverlay from './components/LoadingOverlay'
import { LoadingProvider, useLoading } from './context/LoadingContext'

function AppContent() {
  const { isLoading, loadingMessage } = useLoading()

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Main content - Google style centered layout */}
        <main className="px-4 sm:px-6 py-16">
          {/* Header section - centered like Google - FULL WIDTH */}
          <div className="w-full text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-normal text-gray-900 mb-2">
              AI Feature Builder
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-light">
              Trasforma idee in specifiche tecniche
            </p>
          </div>

          {/* Feature Generator - centered with 65% width of viewport */}
          <div 
            style={{ 
              width: '65vw', 
              maxWidth: '900px', 
              minWidth: '320px', 
              margin: '0 auto'
            }}
          >
            <FeatureGeneratorMinimal />
          </div>
        </main>

        {/* Footer - minimal like Google */}
        <footer className="py-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by OpenRouter AI
          </p>
        </footer>
      </div>

      {/* Full Screen Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
    </>
  )
}

function App() {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  )
}

export default App