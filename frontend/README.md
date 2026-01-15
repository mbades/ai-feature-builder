# AI Feature Builder - Frontend

React frontend per l'applicazione AI Feature Builder che genera specifiche tecniche da descrizioni in linguaggio naturale.

## Tecnologie Utilizzate

- **React 18** - Framework UI
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Client HTTP per chiamate API

## Struttura del Progetto

```
src/
├── components/          # Componenti React
│   ├── Header.jsx      # Header con navigazione
│   ├── Footer.jsx      # Footer informativo
│   ├── FeatureBuilder.jsx  # Componente principale
│   ├── FeatureForm.jsx     # Form di input
│   ├── FeaturePreview.jsx  # Anteprima specifica
│   ├── FeatureExport.jsx   # Esportazione
│   ├── LoadingSpinner.jsx  # Spinner di caricamento
│   └── ErrorDisplay.jsx    # Visualizzazione errori
├── context/
│   └── AppContext.jsx  # Context globale dell'app
├── hooks/
│   └── useApi.js       # Custom hooks per API
├── services/
│   └── api.js          # Servizio API con Axios
├── App.jsx             # Componente root
├── main.jsx           # Entry point
└── index.css          # Stili globali
```

## Funzionalità Implementate

### 🎯 Core Features
- **Form di Input**: Descrizione feature con opzioni avanzate
- **Generazione AI**: Chiamata API per generare specifica
- **Anteprima Strutturata**: Visualizzazione organizzata della specifica
- **Esportazione Multi-formato**: JSON, Markdown, YAML

### 🔧 Gestione Stato
- **Context API**: Stato globale con useReducer
- **Custom Hooks**: Hook specializzati per API calls
- **Error Handling**: Gestione errori completa
- **Loading States**: Stati di caricamento per UX ottimale

### 🎨 UI/UX
- **Design Responsive**: Ottimizzato per desktop e mobile
- **Navigazione a Tab**: Interfaccia intuitiva
- **Feedback Visivo**: Loading spinners, stati di successo/errore
- **Accessibilità**: Supporto screen reader e navigazione keyboard

## Componenti Principali

### FeatureForm
Form principale per l'input della feature:
- Textarea per descrizione (10-2000 caratteri)
- Selezione lingua (IT/EN)
- Livello complessità (Simple/Medium/Complex)
- Template opzionali
- Checkbox per includere test cases

### FeaturePreview
Visualizzazione strutturata della specifica generata:
- **Panoramica**: Info generali e descrizione
- **Requisiti**: Funzionali e non funzionali
- **API Endpoints**: Documentazione completa
- **Modelli Dati**: Tabelle con campi e relazioni
- **Dipendenze**: Librerie e servizi richiesti
- **Test Cases**: Criteri di accettazione e test

### FeatureExport
Esportazione in multipli formati:
- **JSON**: Formato completo per integrazioni
- **Markdown**: Documentazione leggibile
- **YAML**: Configurazioni e CI/CD
- Copia negli appunti e download file

## API Integration

### Endpoint Utilizzati
- `POST /api/generate-spec` - Generazione specifica
- `GET /api/templates` - Lista template disponibili
- `GET /api/ai-health` - Stato servizio AI

### Error Handling
- Gestione errori di rete
- Timeout requests (2 minuti)
- Messaggi di errore localizzati
- Retry automatico per errori temporanei

## Sviluppo

### Avvio Dev Server
```bash
npm run dev
```

### Build Produzione
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Configurazione

### Variabili Ambiente
- `VITE_API_BASE_URL` - Base URL API (default: `/api`)

### Tailwind CSS
Configurazione personalizzata in `tailwind.config.js` con:
- Palette colori estesa
- Breakpoint responsive
- Componenti custom

## Note Implementazione

### Gestione Stato
- Context API per stato globale
- useReducer per logica complessa
- Custom hooks per riutilizzo logica

### Performance
- Lazy loading componenti
- Memoizzazione callback
- Debounce per input validation

### Sicurezza
- Sanitizzazione input
- Validazione client-side
- Gestione sicura errori API

## Prossimi Sviluppi

- [ ] Persistenza locale delle bozze
- [ ] Sistema di template personalizzati
- [ ] Condivisione specifiche via link
- [ ] Integrazione con tool di sviluppo
- [ ] Modalità dark theme
- [ ] Internazionalizzazione completa