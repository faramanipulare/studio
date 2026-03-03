
# Fara Manipulare | Professional Market Intelligence

AI-Powered Economic Calendar and Institutional Market Analysis.

## VPS Deployment & Troubleshooting (502 Bad Gateway)

Dacă primești eroarea **502 Bad Gateway** sau erori de build, urmează acești pași pentru a configura corect VPS-ul:

### 1. Portul Aplicației
Aplicația este configurată să ruleze pe portul **3000**. Asigură-te că fișierul tău de configurare Nginx (`/etc/nginx/sites-available/default`) trimite traficul către portul corect:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 2. Environment Variables
Trebuie să ai o cheie API Gemini validă. Creează fișierul `.env` în rădăcina proiectului:
```env
GOOGLE_GENAI_API_KEY=cheia_ta_de_la_google_ai_studio
```

### 3. Instalare și Pornire (Comenzi Curățare)
Dacă build-ul eșuează cu "Module not found", execută aceste comenzi pe VPS pentru a forța instalarea corectă:
```bash
# Șterge modulele vechi și cache-ul
rm -rf node_modules package-lock.json .next
npm cache clean --force

# Reinstalează pachetele
npm install

# Construiește aplicația pentru producție
npm run build

# Pornire/Repornire cu PM2
pm2 delete fara-manipulare || true
pm2 start npm --name "fara-manipulare" -- start --update-env
```

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore (Cloud-hosted, 0GB local storage used)
- **AI**: Genkit 1.x + Gemini 1.5 Flash (SMC Optimized)
- **Styling**: Tailwind CSS (Fully Responsive / Mobile Optimized)
