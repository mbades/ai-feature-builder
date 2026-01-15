# AI Feature Builder - Backend

Backend API per AI Feature Builder che trasforma descrizioni in linguaggio naturale in specifiche tecniche JSON strutturate.

## Caratteristiche

- **Endpoint REST** per generazione specifiche
- **Integrazione OpenAI** con prompt engineering avanzato
- **Validazione rigorosa** input e output
- **Rate limiting** e sicurezza
- **Logging completo** per debugging e monitoring
- **Error handling** robusto con messaggi specifici

## Installazione

```bash
# Clona il repository
git clone <repository-url>
cd backend

# Installa le dipendenze
npm install

# Copia il file di configurazione
cp .env.example .env

# Configura le variabili d'ambiente
nano .env
```

## Configurazione

Modifica il file `.env` con le tue configurazioni:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Avvio

```bash
# Sviluppo (con auto-reload)
npm run dev

# Produzione
npm start

# Test
npm test

# Linting
npm run lint
```

## API Endpoints

### POST /api/generate-spec

Genera una specifica tecnica da una descrizione in linguaggio naturale.

**Request Body:**
```json
{
  "description": "Voglio creare un sistema di autenticazione utenti con login, registrazione e reset password",
  "language": "it",
  "template": "auth",
  "complexity": "medium",
  "includeTests": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feature": {
      "metadata": { ... },
      "requirements": { ... },
      "architecture": { ... },
      "implementation": { ... },
      "testing": { ... },
      "deployment": { ... }
    },
    "metadata": {
      "generatedAt": "2024-01-13T10:30:00Z",
      "processingTime": 2340,
      "aiModel": "gpt-4",
      "version": "1.0.0",
      "requestId": "req_123456789"
    }
  }
}
```

### GET /api/templates

Restituisce i template disponibili per la generazione.

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "auth",
        "name": "Authentication",
        "description": "User authentication and authorization systems",
        "example": "I need a login system with user registration and password reset"
      }
    ],
    "count": 5
  }
}
```

### GET /health

Health check endpoint per monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-13T10:30:00Z",
  "version": "1.0.0",
  "environment": "development"
}
```

## Struttura del Progetto

```
backend/
├── src/
│   ├── controllers/          # Controller per gestire le richieste
│   │   └── featureController.js
│   ├── middleware/           # Middleware per validazione ed errori
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── routes/              # Definizione delle route
│   │   └── api.js
│   ├── services/            # Logica di business
│   │   ├── aiService.js
│   │   └── featureProcessor.js
│   ├── utils/               # Utilità condivise
│   │   └── logger.js
│   └── server.js            # Entry point dell'applicazione
├── docs/                    # Documentazione e prompt
├── logs/                    # File di log (generati automaticamente)
├── package.json
├── .env.example
└── README.md
```

## Error Handling

L'API gestisce diversi tipi di errori con codici specifici:

- `VALIDATION_ERROR` (400): Errori di validazione input
- `RATE_LIMIT_EXCEEDED` (429): Limite di richieste superato
- `AI_SERVICE_ERROR` (502): Servizio AI non disponibile
- `AI_RESPONSE_INVALID` (502): Risposta AI malformata
- `INTERNAL_ERROR` (500): Errore interno del server

## Logging

Il sistema di logging utilizza Winston con diversi livelli:

- **Error**: Errori critici e eccezioni
- **Warn**: Avvisi e situazioni anomale
- **Info**: Informazioni generali sull'operazione
- **Debug**: Informazioni dettagliate per debugging

I log vengono salvati in:
- `logs/error.log`: Solo errori
- `logs/combined.log`: Tutti i log
- Console: Output formattato per sviluppo

## Sicurezza

- **Helmet**: Protezione headers HTTP
- **CORS**: Configurazione cross-origin
- **Rate Limiting**: Protezione da abuse
- **Input Validation**: Sanitizzazione e validazione rigorosa
- **Error Sanitization**: Nessuna informazione sensibile negli errori

## Monitoraggio

- Health check endpoint per load balancer
- Logging strutturato per analisi
- Metriche di performance (tempo di risposta)
- Request ID per tracciamento delle richieste

## Sviluppo

```bash
# Installa dipendenze di sviluppo
npm install

# Avvia in modalità sviluppo
npm run dev

# Esegui test
npm test

# Controlla codice
npm run lint

# Correggi problemi di linting
npm run lint:fix
```

## Deployment

1. Configura le variabili d'ambiente per produzione
2. Installa dipendenze: `npm ci --only=production`
3. Avvia l'applicazione: `npm start`
4. Configura reverse proxy (nginx) se necessario
5. Configura monitoring e logging centralizzato

## Troubleshooting

### Errore "OpenAI API key not found"
- Verifica che `OPENAI_API_KEY` sia configurata nel file `.env`
- Controlla che la chiave API sia valida e abbia crediti disponibili

### Errore "Rate limit exceeded"
- Aumenta `RATE_LIMIT_MAX_REQUESTS` nel file `.env`
- Implementa autenticazione per utenti premium

### Errore "AI response invalid"
- Controlla i log per vedere la risposta AI completa
- Verifica che il prompt sia aggiornato e corretto
- Prova con un modello AI diverso

## Contribuire

1. Fork del repository
2. Crea un branch per la feature: `git checkout -b feature/nome-feature`
3. Commit delle modifiche: `git commit -am 'Aggiunge nuova feature'`
4. Push del branch: `git push origin feature/nome-feature`
5. Crea una Pull Request