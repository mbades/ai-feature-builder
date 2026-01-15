# 🤖 AI Feature Builder

> Trasforma idee in specifiche tecniche strutturate

Un'applicazione web che utilizza l'intelligenza artificiale per convertire descrizioni in linguaggio naturale di feature software in specifiche tecniche JSON dettagliate e utilizzabili.

## ✨ Caratteristiche

- 🧠 **AI-Powered**: Utilizza GPT-4 per analisi intelligente
- 🎯 **Smart Suggestions**: Suggerimenti dinamici per prompt perfetti
- 📊 **Analisi Real-time**: Feedback progressivo durante la scrittura
- 🎨 **UI Moderna**: Interfaccia pulita e mobile-first
- 📋 **Export Multipli**: README, JSON, React code, API schema
- ⚡ **Performance**: Ottimizzato per velocità e UX

## 🚀 Demo Live

- **Frontend**: [https://ai-feature-builder.vercel.app](https://ai-feature-builder.vercel.app)
- **Backend API**: [https://ai-feature-builder-backend.railway.app](https://ai-feature-builder-backend.railway.app)

## 🛠️ Stack Tecnologico

### Frontend
- **React 18** + **Vite** - Build tool moderno
- **Tailwind CSS** - Styling utility-first
- **Framer Motion** - Animazioni fluide
- **Axios** - HTTP client

### Backend
- **Node.js** + **Express** - Server API
- **OpenAI GPT-4** - Intelligenza artificiale
- **Winston** - Logging avanzato
- **Helmet** + **CORS** - Security

## 📦 Installazione Locale

### Prerequisiti
- Node.js 18+
- npm o yarn
- OpenAI API Key

### Setup Rapido

```bash
# 1. Clona il repository
git clone https://github.com/your-username/ai-feature-builder.git
cd ai-feature-builder

# 2. Installa dipendenze
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 3. Configura environment variables
cp backend/.env.example backend/.env
# Aggiungi la tua OPENAI_API_KEY in backend/.env

# 4. Avvia in sviluppo
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

## 🚀 Deploy in Produzione

### Deploy Automatico (Raccomandato)

```bash
# Setup automatico
./deploy.sh --setup

# Deploy su Vercel + Railway
./deploy.sh
```

### Deploy Manuale

Vedi la [Guida Deploy Completa](DEPLOY_GUIDE.md) per istruzioni dettagliate.

## 📖 Utilizzo

1. **Scrivi la descrizione** della feature che vuoi creare
2. **Usa l'assistente prompt** per suggerimenti intelligenti
3. **Genera la specifica** con un click
4. **Esporta** in formato README, JSON, o codice React

### Esempio Input
```
Sistema di autenticazione completo con registrazione utenti, 
login sicuro, recupero password via email, profili utente 
personalizzabili e gestione sessioni con JWT tokens
```

### Output Generato
- Requisiti funzionali e non-funzionali
- API endpoints con documentazione
- Modelli dati e relazioni
- Test cases e criteri di accettazione
- Dipendenze tecniche
- Stima ore di sviluppo

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test

# Coverage report
npm run test:coverage
```

## 📚 Documentazione

- [Guida Deploy](DEPLOY_GUIDE.md) - Deploy su Vercel + Railway
- [Architettura](docs/architecture.md) - Struttura tecnica
- [API Specification](docs/api-specification.md) - Documentazione API
- [Product Scope](docs/product-scope.md) - Scope del prodotto

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per dettagli.

## 🙏 Riconoscimenti

- [OpenAI](https://openai.com) per l'API GPT-4
- [Vercel](https://vercel.com) per l'hosting frontend
- [Railway](https://railway.app) per l'hosting backend
- [Tailwind CSS](https://tailwindcss.com) per il design system

---

<div align="center">

**Creato con ❤️ per semplificare lo sviluppo software**

[Demo](https://ai-feature-builder.vercel.app) • [Documentazione](docs/) • [Issues](https://github.com/your-username/ai-feature-builder/issues)

</div>