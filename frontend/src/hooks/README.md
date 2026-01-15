# Custom Hooks per Feature Generation

Collezione di custom hooks React ottimizzati per la generazione di feature con gestione avanzata di loading, error e data.

## 📁 Struttura

```
hooks/
├── useFeatureGenerator.js          # Hook avanzato completo
├── useSimpleFeatureGenerator.js    # Hook semplificato
├── useFeatureGeneratorWithCache.js # Hook con cache e persistenza
├── useApi.js                       # Hook base per API generiche
├── useFeatureApi.js               # Hook specifici per Feature API
└── README.md                      # Questa documentazione
```

## 🚀 Hook Principali

### 1. useFeatureGenerator (Avanzato)

Hook completo con tutte le funzionalità avanzate per casi d'uso professionali.

#### Caratteristiche
- ✅ Gestione completa loading/error/data
- ✅ Retry automatico con backoff esponenziale
- ✅ Progress tracking dettagliato
- ✅ Cancellazione richieste
- ✅ Stati derivati e metriche
- ✅ Persistenza dati durante reload
- ✅ Callbacks personalizzabili

#### Utilizzo Base

```javascript
import useFeatureGenerator from '../hooks/useFeatureGenerator'

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
  } = useFeatureGenerator({
    onSuccess: (result, duration) => {
      console.log(`Feature generata in ${duration}ms:`, result.data.feature.name)
    },
    onError: (error) => {
      console.error('Errore:', error.message)
    },
    autoRetry: true,
    maxRetries: 2
  })

  const handleGenerate = () => {
    generateFeature({
      description: "Sistema di autenticazione completo",
      language: "it",
      complexity: "medium"
    })
  }

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? progress : 'Genera Feature'}
      </button>
      
      {error && <div className="error">{error.message}</div>}
      {data && <div className="success">✅ {data.data.feature.name}</div>}
    </div>
  )
}
```

#### Opzioni Avanzate

```javascript
const hook = useFeatureGenerator({
  // Callbacks
  onSuccess: (result, duration, fromCache) => {},
  onError: (error, duration) => {},
  onStart: (requestData) => {},
  onProgress: (message, step, total) => {},
  
  // Retry
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms
  
  // Comportamento
  persistData: true,        // Mantieni data durante nuovo loading
  clearErrorOnRetry: true   // Pulisci errore durante retry
})
```

#### Stati Derivati

```javascript
const {
  // Stati base
  loading, data, error, progress,
  
  // Stati derivati
  isLoading, isError, isSuccess, isIdle,
  canRetry, isRetrying, hasRetriesLeft,
  hasProgress, progressPercentage,
  hasData, dataAge,
  
  // Info errore
  errorType, errorMessage, isNetworkError,
  isTimeoutError, isValidationError, isServerError,
  
  // Performance
  lastDuration, averageResponseTime
} = useFeatureGenerator()
```

### 2. useSimpleFeatureGenerator (Semplificato)

Hook leggero per casi d'uso basilari con footprint minimo.

#### Caratteristiche
- ✅ Gestione essenziale loading/error/data
- ✅ Cancellazione richieste
- ✅ Reset stato
- ✅ Callbacks successo/errore
- ✅ Footprint minimo

#### Utilizzo

```javascript
import useSimpleFeatureGenerator from '../hooks/useSimpleFeatureGenerator'

function SimpleComponent() {
  const {
    loading,
    data,
    error,
    generateFeature,
    reset,
    clearError
  } = useSimpleFeatureGenerator({
    onSuccess: (result) => console.log('Successo!', result),
    onError: (error) => console.error('Errore!', error)
  })

  return (
    <div>
      <button 
        onClick={() => generateFeature({ description: "Test feature" })}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Generate'}
      </button>
      
      {error && (
        <div className="error">
          {error.message}
          <button onClick={clearError}>✕</button>
        </div>
      )}
      
      {data && <div>✅ {data.data.feature.name}</div>}
    </div>
  )
}
```

### 3. useFeatureGeneratorWithCache (Con Cache)

Hook con cache in memoria e localStorage per performance ottimali.

#### Caratteristiche
- ✅ Cache in memoria con TTL
- ✅ Persistenza localStorage
- ✅ Cache hit/miss tracking
- ✅ Invalidazione cache
- ✅ Statistiche cache
- ✅ Pulizia automatica

#### Utilizzo

```javascript
import useFeatureGeneratorWithCache from '../hooks/useFeatureGeneratorWithCache'

function CachedComponent() {
  const {
    loading,
    data,
    error,
    fromCache,
    cacheStats,
    generateFeature,
    clearCache,
    invalidateCache
  } = useFeatureGeneratorWithCache({
    enableCache: true,
    enablePersistence: true,
    cacheTimeout: 10 * 60 * 1000, // 10 minuti
    onCacheHit: (data, source) => {
      console.log(`Cache hit from ${source}:`, data.data.feature.name)
    }
  })

  return (
    <div>
      <button onClick={() => generateFeature({ description: "Test" })}>
        Generate {fromCache && '(cached)'}
      </button>
      
      <div className="cache-info">
        Memory: {cacheStats.memorySize} items
        Storage: {cacheStats.hasStorageData ? '✅' : '❌'}
      </div>
      
      <button onClick={clearCache}>Clear Cache</button>
    </div>
  )
}
```

## 🔧 Configurazioni Avanzate

### Retry Personalizzato

```javascript
const hook = useFeatureGenerator({
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 2000, // 2 secondi base
  // Backoff esponenziale: 2s, 4s, 8s
})
```

### Progress Tracking

```javascript
const hook = useFeatureGenerator({
  onProgress: (message, step, total) => {
    console.log(`Step ${step}/${total}: ${message}`)
    updateProgressBar((step / total) * 100)
  }
})
```

### Cache Avanzata

```javascript
const hook = useFeatureGeneratorWithCache({
  enableCache: true,
  enablePersistence: true,
  cacheTimeout: 15 * 60 * 1000, // 15 minuti
  storageKey: 'myApp_features',
  
  onCacheHit: (data, source) => {
    // Analytics per cache hit
    analytics.track('cache_hit', { source })
  }
})
```

## 📊 Gestione Stati

### Stati Base
- `loading`: Richiesta in corso
- `data`: Dati ricevuti
- `error`: Errore verificato

### Stati Derivati
- `isLoading`: Alias per loading
- `isError`: Presenza di errore
- `isSuccess`: Successo (data presente, no error, no loading)
- `isIdle`: Stato iniziale (no loading, no data, no error)

### Stati Avanzati (useFeatureGenerator)
- `canRetry`: Errore recuperabile
- `isRetrying`: Retry in corso
- `hasRetriesLeft`: Tentativi rimanenti
- `progressPercentage`: Percentuale progresso stimata
- `dataAge`: Età dei dati in ms

## 🚨 Gestione Errori

### Tipi di Errore Riconosciuti

```javascript
const {
  error,
  errorType,
  isNetworkError,
  isTimeoutError,
  isValidationError,
  isServerError
} = useFeatureGenerator()

// Gestione specifica per tipo
if (isNetworkError) {
  showNetworkErrorMessage()
} else if (isTimeoutError) {
  showTimeoutMessage()
} else if (isValidationError) {
  showValidationErrors(error.details)
}
```

### Retry Automatico

Gli errori che supportano retry automatico:
- `REQUEST_TIMEOUT`
- `NETWORK_ERROR`
- `CONNECTION_ERROR`
- `HTTP_500`, `HTTP_502`, `HTTP_503`, `HTTP_504`

## 🎯 Best Practices

### 1. Scelta del Hook Giusto

```javascript
// ✅ Per applicazioni semplici
const simple = useSimpleFeatureGenerator()

// ✅ Per applicazioni professionali
const advanced = useFeatureGenerator({
  autoRetry: true,
  maxRetries: 2
})

// ✅ Per performance critiche
const cached = useFeatureGeneratorWithCache({
  enableCache: true,
  cacheTimeout: 5 * 60 * 1000
})
```

### 2. Gestione Loading States

```javascript
const { loading, progress, progressPercentage } = useFeatureGenerator()

return (
  <div>
    {loading && (
      <div className="loading">
        <div className="spinner" />
        <div className="message">{progress}</div>
        <div className="progress-bar">
          <div style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>
    )}
  </div>
)
```

### 3. Error Boundaries

```javascript
function FeatureGenerator() {
  const { error, generateFeature, clearError } = useFeatureGenerator({
    onError: (error) => {
      // Log per monitoring
      errorLogger.log(error)
      
      // Analytics
      analytics.track('feature_generation_error', {
        code: error.code,
        message: error.message
      })
    }
  })

  return (
    <ErrorBoundary>
      {/* UI components */}
    </ErrorBoundary>
  )
}
```

### 4. Performance Optimization

```javascript
// Memoizza callbacks per evitare re-render
const onSuccess = useCallback((result) => {
  setResults(prev => [...prev, result])
}, [])

const hook = useFeatureGenerator({
  onSuccess,
  persistData: true // Evita flash durante reload
})
```

### 5. Testing

```javascript
// Mock del hook per test
jest.mock('../hooks/useFeatureGenerator', () => ({
  __esModule: true,
  default: () => ({
    loading: false,
    data: mockFeatureData,
    error: null,
    generateFeature: jest.fn(),
    reset: jest.fn()
  })
}))
```

## 🔍 Debug e Monitoring

### Console Logging

```javascript
const hook = useFeatureGenerator({
  onStart: (data) => console.log('🚀 Start:', data),
  onProgress: (msg) => console.log('🔄 Progress:', msg),
  onSuccess: (result, duration) => console.log('✅ Success:', duration + 'ms'),
  onError: (error) => console.error('❌ Error:', error)
})
```

### Performance Monitoring

```javascript
const { lastDuration, averageResponseTime } = useFeatureGenerator()

useEffect(() => {
  if (lastDuration) {
    performanceMonitor.record('feature_generation', lastDuration)
  }
}, [lastDuration])
```

## 🧪 Esempi Completi

Vedi `frontend/src/examples/ImprovedHooksExample.jsx` per esempi completi e interattivi di tutti i hook.

## 🔄 Migration Guide

### Da useApi a useFeatureGenerator

```javascript
// ❌ Vecchio
const { data, loading, error, execute } = useApi(generateFeature)

// ✅ Nuovo
const { data, loading, error, generateFeature } = useFeatureGenerator()
```

### Da useFeatureGeneration a useFeatureGenerator

```javascript
// ❌ Vecchio
const { loading, data, error, generateFeature } = useFeatureGeneration()

// ✅ Nuovo - Più funzionalità
const {
  loading, data, error, progress,
  generateFeature, retry, cancel
} = useFeatureGenerator({
  autoRetry: true,
  maxRetries: 2
})
```