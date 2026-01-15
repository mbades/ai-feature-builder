# 🚀 Guida Deploy Step-by-Step

## 🚂 STEP 1: Deploy Backend su Railway

### 1.1 Accedi a Railway
- Vai su [railway.app](https://railway.app)
- Fai login con il tuo account

### 1.2 Crea Nuovo Progetto
1. Click su "New Project"
2. Seleziona "Deploy from GitHub repo"
3. Seleziona questo repository
4. Scegli "Deploy Now"

### 1.3 Configura il Backend
1. Railway rileverà automaticamente che è un progetto Node.js
2. Vai su **Variables** tab
3. Aggiungi queste variabili:

```bash
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=sk-your-openai-key-here
CORS_ORIGIN=*
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 1.4 Configura il Root Directory
1. Vai su **Settings** tab
2. In "Root Directory" inserisci: `backend`
3. In "Build Command" inserisci: `npm ci --only=production`
4. In "Start Command" inserisci: `npm start`

### 1.5 Deploy
1. Click su "Deploy"
2. Attendi il completamento (2-3 minuti)
3. **COPIA L'URL** del backend (es: `https://ai-feature-builder-backend-production-xxx.up.railway.app`)

---

## 🌐 STEP 2: Deploy Frontend su Vercel

### 2.1 Accedi a Vercel
- Vai su [vercel.com](https://vercel.com)
- Fai login con il tuo account

### 2.2 Importa Progetto
1. Click su "New Project"
2. Seleziona "Import Git Repository"
3. Seleziona questo repository
4. Click su "Import"

### 2.3 Configura il Frontend
1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm ci`

### 2.4 Aggiungi Environment Variables
1. Vai su "Environment Variables"
2. Aggiungi:

```bash
VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app
VITE_APP_NAME=AI Feature Builder
VITE_ENVIRONMENT=production
```

**⚠️ IMPORTANTE**: Sostituisci `your-railway-backend-url` con l'URL copiato dal Railway!

### 2.5 Deploy
1. Click su "Deploy"
2. Attendi il completamento (2-3 minuti)
3. **COPIA L'URL** del frontend (es: `https://ai-feature-builder-xxx.vercel.app`)

---

## 🔄 STEP 3: Aggiorna CORS Backend

### 3.1 Torna su Railway
1. Vai al tuo progetto Railway
2. Vai su **Variables** tab
3. **Modifica** la variabile `CORS_ORIGIN`
4. Sostituisci `*` con l'URL Vercel: `https://ai-feature-builder-xxx.vercel.app`
5. Click su "Save"

### 3.2 Redeploy Backend
1. Vai su **Deployments** tab
2. Click su "Redeploy" sull'ultimo deployment
3. Attendi il completamento

---

## ✅ STEP 4: Test Finale

### 4.1 Verifica Backend
Apri nel browser: `https://your-railway-url.up.railway.app/health`

Dovresti vedere:
```json
{
  "status": "healthy",
  "services": {
    "ai": { "available": true }
  }
}
```

### 4.2 Verifica Frontend
1. Apri l'URL Vercel nel browser
2. Prova a generare una specifica
3. Verifica che tutto funzioni

---

## 🎉 COMPLETATO!

La tua app è ora online e accessibile a tutti!

- **Frontend**: https://your-vercel-url.vercel.app
- **Backend**: https://your-railway-url.up.railway.app

---

## 🔧 Troubleshooting

### ❌ Errore CORS
- Verifica che `CORS_ORIGIN` su Railway sia l'URL esatto di Vercel
- Non dimenticare `https://`

### ❌ API Key Error
- Verifica che `OPENAI_API_KEY` sia corretta su Railway
- Testa la key: `curl -H "Authorization: Bearer sk-your-key" https://api.openai.com/v1/models`

### ❌ Build Failed
- Controlla i logs su Railway/Vercel
- Verifica che `package.json` sia corretto

### ❌ 404 Not Found
- Verifica che il Root Directory sia impostato correttamente
- Frontend: `frontend`
- Backend: `backend`

---

## 📱 Condivisione

Una volta online, puoi condividere l'URL Vercel con chiunque!

L'app è completamente funzionale e pronta per essere utilizzata. 🚀