import { Component } from 'react'

/**
 * Error Boundary component to catch and handle errors gracefully
 * Prevents the entire app from crashing due to component errors
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Oops! Qualcosa è andato storto
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {this.props.errorMessage || 'Si è verificato un errore imprevisto. Prova a ricaricare la pagina.'}
          </p>
          
          {this.props.showRetry !== false && (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
            >
              🔄 Riprova
            </button>
          )}

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-red-600 cursor-pointer">
                Dettagli errore (dev only)
              </summary>
              <pre className="mt-2 text-xs text-red-800 bg-red-100 p-2 rounded overflow-auto">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary