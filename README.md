
# Fara Manipulare | Professional Market Intelligence

AI-Powered Economic Calendar and Institutional Market Analysis.

## VPS Deployment & Environment Variables

Pentru ca AI-ul să funcționeze pe VPS, **trebuie** să creezi un fișier `.env` în rădăcina proiectului:

1. Obține o cheie API de aici: [Google AI Studio](https://aistudio.google.com/)
2. Adaugă următoarea linie în fișierul `.env`:
   ```env
   GOOGLE_GENAI_API_KEY=cheia_ta_aici
   ```

### Pornire cu PM2
Dacă folosești PM2, după ce ai modificat `.env`, rulează:
```bash
pm2 restart fara-manipulare --update-env
```

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore (Cloud-hosted, 0GB local storage used)
- **AI**: Genkit 1.x + Gemini 1.5 Flash
- **Styling**: Tailwind CSS (Fully Responsive / Mobile Optimized)
