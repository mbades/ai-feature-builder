import { useState, useEffect, useMemo, useCallback } from 'react'
import { ANALYSIS_CONFIG, FEATURE_PATTERNS } from '../config/promptCategories'

export const useInputAnalysis = (text) => {
  const [analysis, setAnalysis] = useState({
    completeness: 0,
    suggestions: [],
    quality: 'poor',
    readyToGenerate: false,
    missingElements: [],
    detectedFeatures: []
  })

  // Memoize the analysis function to prevent unnecessary recalculations
  const analyzeText = useCallback(() => {
    if (!text || typeof text !== 'string' || text.length < 10) {
      return {
        completeness: 0,
        suggestions: ['Inizia descrivendo cosa vuoi creare'],
        quality: 'poor',
        readyToGenerate: false,
        feedback: 'Aggiungi più dettagli per iniziare',
        missingElements: ['scopo', 'utenti', 'funzioni'],
        detectedFeatures: []
      }
    }

    let score = 0
    const suggestions = []
    const missingElements = []
    const detectedFeatures = []
    
    try {
      const words = text.toLowerCase().split(/\s+/)
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

      // Length and structure analysis with constants
      if (text.length > 50) score += ANALYSIS_CONFIG.SCORING.LENGTH_50
      if (text.length > 100) score += ANALYSIS_CONFIG.SCORING.LENGTH_100
      if (text.length > 200) score += ANALYSIS_CONFIG.SCORING.LENGTH_200
      if (sentences.length > 1) score += ANALYSIS_CONFIG.SCORING.SENTENCES_MULTIPLE
      if (sentences.length > 3) score += ANALYSIS_CONFIG.SCORING.SENTENCES_MANY

      // Feature detection with error handling
      Object.entries(FEATURE_PATTERNS).forEach(([feature, keywords]) => {
        try {
          if (keywords.some(keyword => words.includes(keyword))) {
            detectedFeatures.push(feature)
            score += ANALYSIS_CONFIG.SCORING.FEATURE_DETECTED
          }
        } catch (error) {
          console.warn(`Error detecting feature ${feature}:`, error)
        }
      })

      // Essential elements analysis
      const hasUsers = words.some(w => ['user', 'utente', 'cliente', 'amministratore'].includes(w))
      const hasInterface = words.some(w => ['interfaccia', 'ui', 'pagina', 'schermata', 'dashboard'].includes(w))
      const hasData = words.some(w => ['database', 'dati', 'salva', 'memorizza', 'gestisce'].includes(w))
      const hasPurpose = words.some(w => ['per', 'sistema', 'piattaforma', 'applicazione', 'tool'].includes(w))
      const hasFeatures = words.some(w => ['con', 'include', 'permette', 'consente', 'funzione'].includes(w))

      if (hasUsers) score += ANALYSIS_CONFIG.SCORING.HAS_USERS; else missingElements.push('utenti')
      if (hasInterface) score += ANALYSIS_CONFIG.SCORING.HAS_INTERFACE; else missingElements.push('interfaccia')
      if (hasData) score += ANALYSIS_CONFIG.SCORING.HAS_DATA; else missingElements.push('gestione dati')
      if (hasPurpose) score += ANALYSIS_CONFIG.SCORING.HAS_PURPOSE; else missingElements.push('scopo principale')
      if (hasFeatures) score += ANALYSIS_CONFIG.SCORING.HAS_FEATURES; else missingElements.push('funzionalità')

      // Smart suggestions based on missing elements and detected features
      if (!hasUsers && text.length > 30) {
        suggestions.push('Specifica chi userà questa feature (utenti, admin, clienti...)')
      }
      if (!hasInterface && text.length > 50) {
        suggestions.push('Descrivi come dovrebbe apparire l\'interfaccia')
      }
      if (!hasData && text.length > 70) {
        suggestions.push('Che tipo di dati deve gestire o memorizzare?')
      }
      
      // Feature-specific suggestions
      if (detectedFeatures.includes('ecommerce') && !words.includes('pagamento')) {
        suggestions.push('Aggiungi dettagli sui metodi di pagamento')
      }
      if (detectedFeatures.includes('auth') && !words.includes('sicurezza')) {
        suggestions.push('Considera aspetti di sicurezza e privacy')
      }
      if (detectedFeatures.includes('dashboard') && !words.includes('filtri')) {
        suggestions.push('Pensa a filtri e opzioni di visualizzazione')
      }

      // Quality assessment with constants
      let quality = 'poor'
      let feedback = 'Aggiungi più dettagli'
      
      if (score >= ANALYSIS_CONFIG.THRESHOLDS.EXCELLENT) {
        quality = 'excellent'
        feedback = '🎉 Perfetto! Pronto per generare una specifica completa'
      } else if (score >= ANALYSIS_CONFIG.THRESHOLDS.GOOD) {
        quality = 'good'
        feedback = '👍 Molto bene! Puoi aggiungere ancora qualche dettaglio'
      } else if (score >= ANALYSIS_CONFIG.THRESHOLDS.FAIR) {
        quality = 'fair'
        feedback = '📝 Buon inizio, continua ad aggiungere dettagli'
      } else if (score >= 20) {
        feedback = '🚀 Stai andando bene, aggiungi più informazioni'
      }

      return {
        completeness: Math.min(score, 100),
        suggestions: suggestions.slice(0, 2),
        quality,
        readyToGenerate: score >= ANALYSIS_CONFIG.THRESHOLDS.READY_TO_GENERATE,
        feedback,
        missingElements: missingElements.slice(0, 3),
        detectedFeatures
      }
    } catch (error) {
      console.error('Error in text analysis:', error)
      return {
        completeness: 0,
        suggestions: ['Errore nell\'analisi del testo'],
        quality: 'poor',
        readyToGenerate: false,
        feedback: 'Errore nell\'analisi',
        missingElements: [],
        detectedFeatures: []
      }
    }
  }, [text]) // Stable dependency

  // Debounced effect with proper cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const newAnalysis = analyzeText()
        setAnalysis(newAnalysis)
      } catch (error) {
        console.error('Error updating analysis:', error)
      }
    }, ANALYSIS_CONFIG.DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [analyzeText])

  return analysis
}