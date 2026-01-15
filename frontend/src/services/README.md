# Feature API Module

Modulo API dedicato per la generazione di feature con gestione completa degli errori e stati di caricamento.

## Struttura

```
services/
├── featureApi.js       # Modulo API principale
└── README.md          # Questa documentazione

hooks/
└── useFeatureApi.js   # Custom hooks per React

examples/
└── FeatureApiExample.jsx  # Esempio di utilizzo
```

## Utilizzo Base

### Import del servizio

```javascript
import featureApiService from '../services/featureApi'
// oppure
import { generateFeature } from '../services/featureApi'
```

### Generazione di una feature

```javascript
const requestData = {
  description: "Sistema di autenticazione con login e registrazione",
  language: "it",
  complexity: "medium",
  template: "auth",
  includeTests: true
}

try {
  const result = await featureApiService.generateFeature(requestData)
  console.log('Feature generata:', result.data.feature)
} catch (error) {
  console.error('Errore:', error.message)
  console.error('Codice:', error.code)
  console.error('Dettagli:', error.details)
}
```

## Custom Hooks

### useFeatureGeneration

Hook completo per la generazione di feature con gestione stati:

```javascript
import { useFeatureGeneration } from '../hooks/useFeatureApi'

function MyComponent() {
  const {
    loading,
    data,
    error,
    progress,
    generateFeature,
    reset,
    cancel,
    retry
  } = useFeatureGeneration({
    onSuccess: (result) => console.log('Successo!', result),
    onError: (error) => console.error('Errore!', error),
    autoRetry: true,
    maxRetries: 2
  })

  const handleGenerate = async () => {
    try {
      await generateFeature({
        description: "La mia feature...",
        language: "it"
      })
    } catch (error) {
      // Errore già gestito dal hook
    }
  }

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? progress : 'Genera Feature'}
      </button>
      
      {error && <div>Errore: {error.message}</div>}
      {data && <div>Successo: {data.data.feature.name}</div>}
    </div>
  )
}
```

### useAiHealthCheck

Hook per monitorare lo stato del servizio AI:

```javascript
import { useAiHealthCheck } from '../hooks/useFeatureApi'

function HealthStatus() {
  const { 
    healthy, 
    lastCheck, 
    checkHealth,
    startPeriodicCheck 
  } = useAiHealthCheck({
    immediate: true,
    interval: 30000
  })

  return (
    <div>
      <div className={healthy ? 'text-green-600' : 'text-red-600'}>
        AI Service: {healthy ? 'Operativo' : 'Non disponibile'}
      </div>
      <button onClick={checkHealth}>Verifica Stato</button>
      <button onClick={startPeriodicCheck}>Controllo Automatico</button>
    </div>
  )
}
```

## Gestione Errori

Il modulo fornisce una gestione errori completa e consistente:

### Tipi di Errore

```javascript
// Errori di validazione
{
  code: 'VALIDATION_ERROR',
  message: 'Dati di input non validi',
  details: ['La descrizione è obbligatoria'],
  status: 400
}

// Errori di rete
{
  code: 'NETWORK_ERROR',
  message: 'Errore di connessione',
  status: 0
}

// Errori di timeout
{
  code: 'REQUEST_TIMEOUT',
  message: 'La generazione sta richiedendo più tempo del previsto',
  status: 0
}

// Errori del server
{
  code: 'HTTP_500',
  message: 'Errore interno del server',
  status: 500,
  requestId: 'req_123456789'
}
```

### Retry Automatico

Il sistema supporta retry automatico per errori recuperabili:

```javascript
const { generateFeature } = useFeatureGeneration({
  autoRetry: true,
  maxRetries: 3
})
```

Errori che supportano retry automatico:
- `REQUEST_TIMEOUT`
- `NETWORK_ERROR`
- `CONNECTION_ERROR`
- `HTTP_500`, `HTTP_502`, `HTTP_503`, `HTTP_504`

## Validazione Input

Il modulo valida automaticamente i dati di input:

### Regole di Validazione

- **description**: Obbligatoria, 10-2000 caratteri
- **language**: Opzionale, valori: `'it'`, `'en'`
- **complexity**: Opzionale, valori: `'simple'`, `'medium'`, `'complex'`
- **template**: Opzionale, valori: `'crud'`, `'auth'`, `'ecommerce'`, `'api'`, `'dashboard'`
- **includeTests**: Opzionale, booleano

### Esempio Validazione

```javascript
// ❌ Errore di validazione
await generateFeature({
  description: "Troppo corto"  // < 10 caratteri
})
// Throw: { code: 'VALIDATION_ERROR', details: ['La descrizione deve essere di almeno 10 caratteri'] }

// ✅ Dati validi
await generateFeature({
  description: "Sistema completo di gestione utenti con autenticazione e autorizzazione",
  language: "it",
  complexity: "medium"
})
```

## Logging e Debug

Il modulo include logging completo per debug:

### Development Mode
```javascript
// Console output automatico in development
🚀 Feature API Request: POST /api/generate-feature
✅ Feature API Success: 2.3s - req_123456789
❌ Feature API Error: HTTP_500 - req_123456789
```

### Metadata Response
```javascript
const result = await generateFeature(data)
console.log(result._metadata)
// {
//   requestId: 'req_123456789',
//   duration: 2340,
//   timestamp: '2024-01-13T10:30:00Z'
// }
```

## Configurazione

### Timeout
```javascript
// Default: 120 secondi (2 minuti)
// Configurabile in featureApi.js
const featureApi = axios.create({
  timeout: 120000
})
```

### Base URL
```javascript
// Default: '/api'
// Configurabile tramite environment
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
```

## Esempi Avanzati

### Gestione Progress Custom

```javascript
const { generateFeature } = useFeatureGeneration({
  onStart: (data) => {
    console.log('Inizio generazione per:', data.description)
  },
  onSuccess: (result) => {
    console.log('Generata feature:', result.data.feature.name)
    // Salva in localStorage, invia analytics, etc.
  },
  onError: (error) => {
    console.error('Errore generazione:', error)
    // Invia error tracking, mostra notifica, etc.
  }
})
```

### Integrazione con Context

```javascript
// In un Context Provider
const AppProvider = ({ children }) => {
  const featureGeneration = useFeatureGeneration({
    onSuccess: (result) => {
      // Aggiorna stato globale
      dispatch({ type: 'FEATURE_GENERATED', payload: result })
    }
  })

  return (
    <AppContext.Provider value={{ featureGeneration }}>
      {children}
    </AppContext.Provider>
  )
}
```

### Cancellazione Richieste

```javascript
function GenerateButton() {
  const { loading, generateFeature, cancel } = useFeatureGeneration()

  return (
    <div>
      <button onClick={() => generateFeature(data)} disabled={loading}>
        Genera
      </button>
      {loading && (
        <button onClick={cancel}>
          Annulla
        </button>
      )}
    </div>
  )
}
```

## Testing

### Mock del Servizio

```javascript
// In test files
jest.mock('../services/featureApi', () => ({
  generateFeature: jest.fn(),
  checkHealth: jest.fn()
}))

// Test
import featureApiService from '../services/featureApi'

test('should generate feature', async () => {
  featureApiService.generateFeature.mockResolvedValue({
    success: true,
    data: { feature: { name: 'Test Feature' } }
  })

  const result = await featureApiService.generateFeature({
    description: 'Test description'
  })

  expect(result.data.feature.name).toBe('Test Feature')
})
```

## Troubleshooting

### Errori Comuni

1. **VALIDATION_ERROR**: Controlla che i dati di input rispettino le regole
2. **REQUEST_TIMEOUT**: Riduci la complessità della descrizione
3. **NETWORK_ERROR**: Verifica connessione internet
4. **HTTP_429**: Attendi prima di fare nuove richieste (rate limiting)
5. **HTTP_502**: Servizio AI temporaneamente non disponibile

### Debug

```javascript
// Abilita logging dettagliato
localStorage.setItem('debug', 'featureApi:*')

// Verifica stato servizio
const health = await featureApiService.checkHealth()
console.log('AI Service Health:', health)
```