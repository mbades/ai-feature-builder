import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext()

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Caricamento in corso...')

  const showLoading = (message = 'Caricamento in corso...') => {
    setLoadingMessage(message)
    setIsLoading(true)
    // Blocca lo scroll del body
    document.body.style.overflow = 'hidden'
  }

  const hideLoading = () => {
    setIsLoading(false)
    // Ripristina lo scroll del body
    document.body.style.overflow = 'unset'
  }

  const value = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}