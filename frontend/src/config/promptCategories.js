/**
 * Configuration for prompt builder categories and suggestions
 * Extracted from components to improve maintainability and performance
 */

export const PROMPT_CATEGORIES = {
  basics: {
    label: '🎯 Base',
    chips: [
      { text: 'Sistema di ', description: 'Inizia con "Sistema di..."' },
      { text: 'Applicazione per ', description: 'App per uno scopo specifico' },
      { text: 'Dashboard per ', description: 'Interfaccia di controllo' },
      { text: 'Piattaforma di ', description: 'Piattaforma completa' },
      { text: 'Tool per ', description: 'Strumento specifico' },
      { text: 'API per ', description: 'Servizio API' }
    ]
  },
  users: {
    label: '👥 Utenti',
    chips: [
      { text: 'per utenti registrati', description: 'Richiede autenticazione' },
      { text: 'per amministratori', description: 'Pannello admin' },
      { text: 'per clienti', description: 'Interfaccia cliente' },
      { text: 'per team', description: 'Collaborazione di gruppo' },
      { text: 'per pubblico generico', description: 'Accesso libero' },
      { text: 'con ruoli diversi', description: 'Sistema di permessi' }
    ]
  },
  features: {
    label: '⚡ Funzioni',
    chips: [
      { text: 'con autenticazione', description: 'Login/registrazione' },
      { text: 'con notifiche', description: 'Sistema di notifiche' },
      { text: 'con ricerca avanzata', description: 'Filtri e ricerca' },
      { text: 'con export dati', description: 'Esportazione file' },
      { text: 'con analytics', description: 'Statistiche e report' },
      { text: 'con API REST', description: 'Interfaccia API' },
      { text: 'con real-time', description: 'Aggiornamenti live' },
      { text: 'con pagamenti', description: 'Sistema di pagamento' }
    ]
  },
  data: {
    label: '💾 Dati',
    chips: [
      { text: 'che gestisce utenti', description: 'Database utenti' },
      { text: 'che salva documenti', description: 'Gestione file' },
      { text: 'che traccia attività', description: 'Log e cronologia' },
      { text: 'che memorizza preferenze', description: 'Configurazioni utente' },
      { text: 'con backup automatico', description: 'Sicurezza dati' },
      { text: 'con sincronizzazione', description: 'Sync multi-device' }
    ]
  },
  ui: {
    label: '🎨 Interfaccia',
    chips: [
      { text: 'con interfaccia moderna', description: 'UI contemporanea' },
      { text: 'responsive mobile', description: 'Ottimizzato mobile' },
      { text: 'con dark mode', description: 'Tema scuro' },
      { text: 'con drag & drop', description: 'Interazioni intuitive' },
      { text: 'con grafici interattivi', description: 'Visualizzazioni dati' },
      { text: 'con editor rich text', description: 'Editor avanzato' }
    ]
  },
  integrations: {
    label: '🔗 Integrazioni',
    chips: [
      { text: 'integrato con Google', description: 'Servizi Google' },
      { text: 'con notifiche email', description: 'Sistema email' },
      { text: 'con social login', description: 'Login social' },
      { text: 'con Stripe/PayPal', description: 'Pagamenti online' },
      { text: 'con Slack/Discord', description: 'Chat integrations' },
      { text: 'con calendario', description: 'Gestione eventi' }
    ]
  }
}

export const PROMPT_TEMPLATES = [
  {
    title: '🔐 Sistema Auth',
    template: 'Sistema di autenticazione completo con registrazione utenti, login sicuro, recupero password via email, profili utente personalizzabili e gestione sessioni con JWT tokens'
  },
  {
    title: '📊 Dashboard Analytics',
    template: 'Dashboard analytics interattiva con grafici real-time, filtri avanzati, export dati in PDF/Excel, notifiche personalizzate e sistema di report automatici per amministratori'
  },
  {
    title: '🛒 E-commerce Platform',
    template: 'Piattaforma e-commerce completa con catalogo prodotti, carrello intelligente, checkout sicuro, pagamenti Stripe/PayPal, gestione ordini e sistema di recensioni clienti'
  },
  {
    title: '💬 Chat Real-time',
    template: 'Sistema di chat real-time con messaggi istantanei, condivisione file, notifiche push, stanze private/pubbliche, moderazione automatica e cronologia messaggi'
  }
]

// Constants for analysis scoring
export const ANALYSIS_CONFIG = {
  SCORING: {
    LENGTH_50: 15,
    LENGTH_100: 15,
    LENGTH_200: 10,
    SENTENCES_MULTIPLE: 10,
    SENTENCES_MANY: 10,
    FEATURE_DETECTED: 8,
    HAS_USERS: 15,
    HAS_INTERFACE: 10,
    HAS_DATA: 10,
    HAS_PURPOSE: 15,
    HAS_FEATURES: 10
  },
  THRESHOLDS: {
    EXCELLENT: 80,
    GOOD: 60,
    FAIR: 40,
    READY_TO_GENERATE: 35
  },
  DEBOUNCE_MS: 300
}

export const FEATURE_PATTERNS = {
  auth: ['login', 'registrazione', 'autenticazione', 'password', 'utenti'],
  ecommerce: ['carrello', 'pagamento', 'prodotti', 'ordini', 'checkout'],
  dashboard: ['dashboard', 'grafici', 'analytics', 'statistiche', 'report'],
  chat: ['chat', 'messaggi', 'real-time', 'notifiche'],
  crud: ['gestione', 'creare', 'modificare', 'eliminare', 'lista'],
  api: ['api', 'endpoint', 'rest', 'json', 'integrazione']
}

export const FEATURE_EMOJIS = {
  auth: '🔐',
  ecommerce: '🛒',
  dashboard: '📊',
  chat: '💬',
  crud: '📝',
  api: '🔌'
}