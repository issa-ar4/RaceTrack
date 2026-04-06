# RaceTrack AI — Race Day Strategy Generator

A free AI-powered race day strategy tool for endurance athletes. Input your race details, training background, and conditions — get a personalized pacing plan, fueling schedule, and gear checklist.

Part of the [@issa.exercise](https://instagram.com/issa.exercise) free fitness app suite.

## What It Does

- Generates a **mile/km-by-mile pacing strategy** adjusted for elevation and weather
- Creates a **fueling & hydration schedule** with timing and product suggestions
- Produces a **race day checklist** (gear, warm-up, mental cues)
- Supports 5K, 10K, half marathon, marathon, and ultramarathon distances

## Tech Stack

- **Frontend:** React (single-page app, Tailwind CSS)
- **AI:** Groq API (free tier, Llama 3.3 70B) — no backend needed, client-side calls
- **Deploy:** Vercel (free tier)

## API Key Model

The app ships with a default free-tier API key for instant use. If rate limits are hit, the user is prompted to enter their own key. Users can also input their own key anytime via settings.

## Quick Start

```bash
git clone https://github.com/yourusername/RaceTrack-ai.git
cd RaceTrack-ai
npm install
# Add your Groq key to .env.local as VITE_DEFAULT_GROQ_KEY
npm run dev
```

## License

MIT
# RaceTrack
