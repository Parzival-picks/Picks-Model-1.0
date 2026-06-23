# ⚽ Picks Model — Dixon-Coles Football Predictor

Modelo estadístico de predicción de fútbol basado en Dixon-Coles (1997).
Se actualiza automáticamente con los partidos del día via API-Football.

## Stack
- **Next.js 14** — frontend + API routes
- **API-Football** (RapidAPI) — fixtures y estadísticas
- **Vercel** — hosting gratuito

---

## Setup local

```bash
npm install
```

Crea `.env.local` con tus keys:
```
RAPIDAPI_KEY=tu_key_aqui
RAPIDAPI_HOST=api-football186.p.rapidapi.com
```

```bash
npm run dev
# Abre http://localhost:3000
```

---

## Deploy en Vercel

### Paso 1 — Sube a GitHub
1. Crea un repo en github.com (botón "New repository")
2. Nombre: `picks-model`
3. Arrastra los archivos de esta carpeta al repo (o usa GitHub Desktop)

### Paso 2 — Conecta Vercel
1. Ve a **vercel.com** → "Add New Project"
2. Importa tu repo de GitHub
3. En **"Environment Variables"** agrega:
   - `RAPIDAPI_KEY` = `5c064145b8mshec42d7a43aa8b7fp1728b6jsn404ca50d5c1c`
   - `RAPIDAPI_HOST` = `api-football186.p.rapidapi.com`
4. Click **"Deploy"** ✅

Tu app estará en: `https://picks-model.vercel.app`

---

## Cómo funciona el modelo

1. **API-Football** entrega los partidos del día
2. Por cada partido, se obtienen las estadísticas de los equipos
3. Se calculan los **xG** (goles esperados) con el modelo Dixon-Coles
4. El modelo genera probabilidades para todos los mercados
5. Si ingresas las cuotas de tu casa, calcula el **edge** automáticamente

---

## Disclaimer
Este es un análisis estadístico, no un consejo financiero. +18. Juega con responsabilidad.
