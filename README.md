# Fara Manipulare | Professional Market Intelligence

AI-Powered Economic Calendar and Institutional Market Analysis built with Next.js, Shadcn UI, and Genkit.

## VPS Deployment Guide

To run this project on your own Virtual Private Server (VPS), follow these steps:

### 1. Prerequisites
- **Node.js**: Version 18.17 or later.
- **NPM**: Included with Node.js.
- **Gemini API Key**: You will need an API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Environment Setup
Create a `.env` file in the root directory of your project on the VPS:
```env
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

### 3. Installation & Build
1. Upload your project files to the VPS (excluding `node_modules` and `.next`).
2. Navigate to the project directory:
   ```bash
   cd path/to/fara-manipulare
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```

### 4. Running the Application
You can start the server using:
```bash
npm start
```

### 5. Production Process Management (Recommended)
To keep the app running in the background and restart it automatically if it crashes, use **PM2**:
1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
2. Start the app:
   ```bash
   pm2 start npm --name "fara-manipulare" -- start -- -p 3000
   ```

### 6. Reverse Proxy (Nginx)
It is recommended to use Nginx as a reverse proxy to handle SSL and map port 80/443 to the Node.js application running on port 3000.

## Development
To run the project locally in development mode:
```bash
npm run dev
```

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **AI**: Genkit + Gemini 2.5 Flash
- **Icons**: Lucide React
- **Date Handling**: date-fns
