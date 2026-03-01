# SesomNod Engine — Frontend

**Elite sports betting analytics. Precision over chaos.**

A Progressive Web App (PWA) built with Next.js 14, Tailwind CSS, and Recharts. Connects to the [SesomNod Engine API](https://sesomnod-api-production.up.railway.app) on Railway.

---

## Features

- **Dagens Kamp** — Today's analysed match with EV%, Kelly stake, confidence ring, xG bars, and Monte Carlo simulation chart
- **History** — Equity curve chart, full picks table with filters (league, result, search), live bankroll display
- **Add Pick** — Full form to register picks (league, teams, odds, stake, EV%, tier, comment)
- **Stats** — ROI, win rate, profit 30d, avg CLV, win/loss breakdown bar, ROI-per-league chart

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| PWA | Custom service worker + manifest |
| API | Railway FastAPI backend |
| Hosting | Vercel (recommended) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=https://sesomnod-api-production.up.railway.app
```

## Deploy to Vercel

1. Push this repo to GitHub (`mossema27-dot/sesomnod-frontend`)
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://sesomnod-api-production.up.railway.app`
4. Deploy — done!

## PWA Installation

On mobile (iOS/Android), open the deployed URL in Safari/Chrome and tap **"Add to Home Screen"** for a native app experience.

## API Endpoints Used

| Endpoint | Usage |
|----------|-------|
| `GET /health` | Status check |
| `GET /dagens-kamp` | Fetch today's analysed match |
| `GET /picks` | All picks history |
| `GET /bankroll` | Bankroll history |
| `POST /picks` | Add new pick |

---

*Built for SesomNod Engine v8.0 — Railway Edition*
