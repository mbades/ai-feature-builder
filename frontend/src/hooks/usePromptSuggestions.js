import { useMemo } from 'react'
import { PROMPT_CATEGORIES } from '../config/promptCategories'

/**
 * Custom hook for generating smart prompt suggestions
 * Separated from component for better performance and testability
 */
export const usePromptSuggestions = (currentText) => {
  const smartSuggestions = useMemo(() => {
    if (!currentText || typeof currentText !== 'string') {
      return [{
        type: 'start',
        title: '🚀 Inizia con una base',
        description: 'Scegli come iniziare il tuo prompt',
        chips: PROMPT_CATEGORIES.basics.chips.slice(0, 3)
      }]
    }

    const text = currentText.toLowerCase()
    const suggestions = []

    // Early return for very short text
    if (text.length < 20) {
      suggestions.push({
        type: 'start',
        title: '🚀 Inizia con una base',
        description: 'Scegli come iniziare il tuo prompt',
        chips: PROMPT_CATEGORIES.basics.chips.slice(0, 3)
      })
      return suggestions
    }

    // Check for missing user specification
    if (!text.includes('user') && !text.includes('utent') && text.length > 20) {
      suggestions.push({
        type: 'users',
        title: '👥 Chi lo userà?',
        description: 'Specifica il tipo di utenti',
        chips: PROMPT_CATEGORIES.users.chips.slice(0, 3)
      })
    }

    // Check for missing UI specification
    if (text.length > 50 && !text.includes('interfaccia') && !text.includes('ui')) {
      suggestions.push({
        type: 'ui',
        title: '🎨 Come dovrebbe apparire?',
        description: 'Aggiungi dettagli sull\'interfaccia',
        chips: PROMPT_CATEGORIES.ui.chips.slice(0, 3)
      })
    }

    // Check for missing data specification
    if (text.length > 80 && !text.includes('dati') && !text.includes('salva')) {
      suggestions.push({
        type: 'data',
        title: '💾 Che dati gestisce?',
        description: 'Specifica la gestione dei dati',
        chips: PROMPT_CATEGORIES.data.chips.slice(0, 3)
      })
    }

    return suggestions.slice(0, 2) // Max 2 suggestions for better UX
  }, [currentText])

  const detectedContext = useMemo(() => {
    if (!currentText || typeof currentText !== 'string') return []
    
    const text = currentText.toLowerCase()
    const detected = []

    // Detect context and suggest relevant categories
    if (text.includes('user') || text.includes('utent')) {
      detected.push('users')
    }
    if (text.includes('dashboard') || text.includes('admin')) {
      detected.push('features', 'ui')
    }
    if (text.includes('e-commerce') || text.includes('shop')) {
      detected.push('features', 'integrations')
    }
    if (text.includes('chat') || text.includes('messag')) {
      detected.push('features', 'integrations')
    }
    if (text.includes('dati') || text.includes('database')) {
      detected.push('data')
    }

    return [...new Set(detected)] // Remove duplicates
  }, [currentText])

  return {
    smartSuggestions,
    detectedContext
  }
}