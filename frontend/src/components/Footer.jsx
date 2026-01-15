export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Info */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>MVP - Versione di sviluppo</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Dati non persistenti</span>
            </div>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a 
              href="#" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                // Future: Open help modal or documentation
              }}
            >
              Aiuto
            </a>
            
            <a 
              href="#" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                // Future: Open feedback form
              }}
            >
              Feedback
            </a>
            
            <div className="text-gray-400">
              v1.0.0
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          Powered by AI • Genera specifiche tecniche da descrizioni in linguaggio naturale
        </div>
      </div>
    </footer>
  )
}