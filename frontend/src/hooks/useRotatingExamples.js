import { useState, useEffect } from 'react'

const examples = [
  "Sistema di autenticazione con login social e recupero password",
  "Dashboard analytics con grafici interattivi e filtri avanzati",
  "E-commerce completo con carrello, pagamenti e gestione ordini",
  "Chat real-time con notifiche push e condivisione file",
  "CRM per gestione clienti con pipeline vendite e automazioni",
  "Blog platform con editor rich text e sistema commenti",
  "Task manager con collaborazione team e scadenze",
  "Sistema di prenotazioni con calendario e notifiche email"
]

export const useRotatingExamples = (intervalMs = 3000) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentExample, setCurrentExample] = useState(examples[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % examples.length
        setCurrentExample(examples[nextIndex])
        return nextIndex
      })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs])

  return {
    currentExample,
    allExamples: examples,
    currentIndex
  }
}