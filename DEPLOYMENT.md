# 🚀 AI Feature Builder - Deployment Guide

## 📋 Quick Start (5 minuti)

### Opzione 1: Deploy Automatico (Raccomandato)

```bash
# 1. Setup iniziale
./deploy.sh --setup

# 2. Modifica i file .env con le tue API keys
# backend/.env - Aggiungi la tua OPENAI_API_KEY

# 3. Deploy automatico
./deploy.sh
# Scegli opzione 1 (Quick Deploy)
```

### Opzione 2: Deploy Manuale

#### Frontend su Vercel
```bash
# 1. Installa Vercel CLI
npm install -g vercel

# 2. Build e deploy
cd frontend
npm ci
npm run build
vercel --prod
```

#### Backend su Railway
```bash
# 1. Installa Railway CLI
npm install -g @railway/cli

# 2. Login e deploy
railway login
railway deploy
```

---

## 🌐 Piattaforme di Deployment

### 🥇 **VERCEL (Frontend) + RAILWAY (Backend)**
**⏱️ Tempo: 5 minuti | 💰 Costo: Gratis | 🔧 Difficoltà: Facile**

**Vantaggi:**
- ✅ Deploy automatico da Git
- ✅ SSL certificato gratuito
- ✅ CDN globale
- ✅ Scaling automatico
- ✅ Zero configurazione

**Setup:**
1. **Vercel (Frontend):**
   - Connetti il repo GitHub
   - Imposta build command: `cd frontend && npm run build`
   - Imposta output directory: `frontend/dist`

2. **Railway (Backend):**
   - Connetti il repo GitHub
   - Imposta start command: `cd backend && npm start`
   - Aggiungi variabili ambiente

### 🥈 **NETLIFY (Frontend) + RENDER (Backend)**
**⏱️ Tempo: 7 minuti | 💰 Costo: Gratis | 🔧 Difficoltà: Facile**

**Setup Netlify:**
```bash
# netlify.toml
[build]
  command = "cd frontend && npm run build"
  publish = "frontend/dist"

[build.environment]
  VITE_API_BASE_URL = "https://your-app.onrender.com"
```

### 🥉 **DOCKER + VPS**
**⏱️ Tempo: 15 minuti | 💰 Costo: $5-20/mese | 🔧 Difficoltà: Media**

```bash
# Build e run
docker build -t ai-feature-builder .
docker run -p 3001:3001 -e OPENAI_API_KEY=your_key ai-feature-builder
```

---

## 🔧 Configurazione Ambiente

### Variabili Backend (.env)
```bash
# Obbligatorie
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com

# Opzionali
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
OPENAI_MODEL=gpt-4
```

### Variabili Frontend (.env)
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_APP_NAME=AI Feature Builder
```

---

## 🚀 Deploy Commands

### Build Locale
```bash
# Frontend
cd frontend
npm ci
npm run build

# Backend
cd backend
npm ci --only=production
```

### Test Locale
```bash
# Frontend (dev server)
cd frontend && npm run dev

# Backend (dev server)
cd backend && npm run dev

# Test produzione locale
cd frontend && npm run preview
```

### Docker
```bash
# Build
docker build -t ai-feature-builder .

# Run
docker run -p 3001:3001 \
  -e OPENAI_API_KEY=your_key \
  -e CORS_ORIGIN=http://localhost:3000 \
  ai-feature-builder

# Con docker-compose
docker-compose up -d
```

---

## 🔍 Troubleshooting

### Errori Comuni

#### ❌ "CORS Error"
```bash
# Soluzione: Aggiorna CORS_ORIGIN nel backend
CORS_ORIGIN=https://your-actual-frontend-domain.com
```

#### ❌ "API Key Invalid"
```bash
# Verifica la tua OpenAI API key
curl -H "Authorization: Bearer your-key" https://api.openai.com/v1/models
```

#### ❌ "Build Failed"
```bash
# Pulisci cache e reinstalla
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "Port Already in Use"
```bash
# Cambia porta nel backend
PORT=3002 npm start
```

### Health Check
```bash
# Verifica backend
curl https://your-backend-domain.com/health

# Risposta attesa:
{
  "status": "healthy",
  "services": {
    "ai": { "available": true }
  }
}
```

---

## 📊 Monitoring

### Logs
```bash
# Railway
railway logs

# Vercel
vercel logs

# Docker
docker logs container-name
```

### Metriche
- **Response Time:** < 2s per generazione
- **Uptime:** > 99.9%
- **Error Rate:** < 1%

---

## 🔒 Security Checklist

- ✅ HTTPS abilitato
- ✅ API keys in variabili ambiente
- ✅ CORS configurato correttamente
- ✅ Rate limiting attivo
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Error handling

---

## 💡 Tips per Performance

1. **Frontend:**
   - Usa Vite per build ottimizzati
   - Abilita gzip compression
   - Lazy loading componenti

2. **Backend:**
   - Cache delle risposte AI
   - Connection pooling
   - Graceful shutdown

3. **Database (se necessario):**
   - Connection pooling
   - Query optimization
   - Backup automatici

---

## 🆘 Support

Se hai problemi:

1. **Controlla i logs** delle piattaforme
2. **Verifica le variabili ambiente**
3. **Testa localmente** prima del deploy
4. **Controlla la documentazione** delle piattaforme

### Link Utili
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

**🎉 La tua app sarà online in pochi minuti!**