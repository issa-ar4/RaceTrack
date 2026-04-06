# IMPLEMENTATION.md — RaceTrack AI

Complete implementation guide. This document is the single source of truth for building the app.

---

## 1. Project Setup

```bash
npm create vite@latest RaceTrack-ai -- --template react
cd RaceTrack-ai
npm install groq-sdk
npm install -D tailwindcss @tailwindcss/vite
```

Vite + React + Tailwind. No backend, no router — single page app. All AI calls happen client-side directly to Groq's API.

**Environment variable:** `VITE_DEFAULT_GROQ_KEY` — the app owner's free-tier Groq API key, bundled into the build. This is intentionally exposed client-side; it's a free-tier key with rate limits as the only protection.

---

## 2. API Key Management

This is the core pattern shared across all @issa.exercise apps.

### Logic

```
1. On app load, check localStorage for `user_groq_key`
2. If found, use it for all requests
3. If not found, use VITE_DEFAULT_GROQ_KEY (the bundled default)
4. On any 429 (rate limit) error from the default key:
   - Show a modal: "High demand right now. Enter your own free Groq API key to continue."
   - Link to https://console.groq.com (free, no credit card)
   - Input field for their key, save to localStorage
5. Always show a small "⚙️ API Key" button in the header that opens the same modal,
   so users can proactively enter their own key anytime
6. Modal has a "Reset to default" option to clear their key
```

### API Key Settings Component (`ApiKeyModal.jsx`)

- Controlled modal, toggled by header gear icon
- Input field (password type, with show/hide toggle)
- "Save" button → saves to `localStorage("user_groq_key")`
- "Reset to default" button → removes from localStorage
- Current status indicator: "Using: your key" or "Using: default key"

### Groq Client Helper (`lib/groq.js`)

```javascript
import Groq from "groq-sdk";

export function getGroqClient() {
  const userKey = localStorage.getItem("user_groq_key");
  const apiKey = userKey || import.meta.env.VITE_DEFAULT_GROQ_KEY;

  return new Groq({
    apiKey,
    dangerouslyAllowBrowser: true, // required for client-side usage
  });
}

export function isUsingDefaultKey() {
  return !localStorage.getItem("user_groq_key");
}
```

### Error Handling Wrapper

```javascript
export async function callGroq(messages) {
  const client = getGroqClient();
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    });
    return { success: true, content: response.choices[0].message.content };
  } catch (error) {
    if (error.status === 429 && isUsingDefaultKey()) {
      return { success: false, rateLimited: true };
    }
    return { success: false, error: error.message };
  }
}
```

When `rateLimited: true` is returned, the parent component opens the API key modal automatically.

---

## 3. Component Structure

```
src/
├── App.jsx              ← layout, header, state management
├── components/
│   ├── RaceForm.jsx     ← input form (race details + athlete profile)
│   ├── StrategyOutput.jsx ← renders the AI-generated strategy
│   ├── ApiKeyModal.jsx  ← API key settings modal
│   └── LoadingSpinner.jsx
├── lib/
│   └── groq.js          ← API client + error handling (from section 2)
└── prompts/
    └── raceStrategy.js  ← builds the system + user prompt
```

**Total: ~6 files of real logic.** Keep it minimal.

---

## 4. Race Form (`RaceForm.jsx`)

A single form with two sections. All fields are simple inputs/selects — no multi-step wizard.

### Section A: Race Details

| Field | Type | Options/Validation |
|---|---|---|
| Race distance | Select | 5K, 10K, Half Marathon, Marathon, Ultra (custom km) |
| Goal time | Text input | Format: HH:MM:SS or MM:SS |
| Race date | Date picker | Used for weather context |
| Race location / city | Text input | Free text, used for weather/altitude context |
| Elevation profile | Select | Flat, Rolling hills, Hilly, Mountainous |
| Expected weather | Select | Cool (<10°C), Mild (10-20°C), Warm (20-30°C), Hot (>30°C) |
| Expected humidity | Select | Low, Moderate, High |

### Section B: Athlete Profile

| Field | Type | Options/Validation |
|---|---|---|
| Experience level | Select | Beginner (first race), Intermediate (2-5 races), Advanced (5+) |
| Current weekly mileage | Number input | In km or miles (toggle) |
| Longest recent run | Number input | In km or miles |
| Known sensitivities | Multi-select chips | Caffeine, GI issues, heat sensitivity, altitude sensitivity, none |
| Preferred fuel type | Select | Gels, chews, real food, liquid nutrition, unsure |

### Submit Button

- Label: "Generate My Race Strategy"
- Disabled state while loading
- Validate: goal time and distance are required, everything else has sensible defaults

---

## 5. AI Prompt (`prompts/raceStrategy.js`)

```javascript
export function buildRacePrompt(formData) {
  const system = `You are an elite running coach and race strategist. Generate a race day strategy based on the athlete's profile. Be specific with pacing (per-mile or per-km splits), fueling timing, and practical advice.

Return your response in this exact markdown structure:

## Pacing Strategy
A table with columns: Segment | Target Pace | Cumulative Time | Notes
Break the race into logical segments (e.g., every 5K for a marathon, every mile for shorter races).
Adjust pace for elevation and weather. Include specific adjustments (e.g., "+10 sec/mile on hills").

## Fueling & Hydration Plan
A table with columns: When | What | Amount | Notes
Start fueling BEFORE the race (morning nutrition).
Include specific products/types based on their preference.
Account for weather (more fluids in heat).
Flag GI sensitivity adjustments if applicable.

## Race Day Checklist
### Night Before
### Morning Of
### At the Start Line
### During the Race (mental cues)
### Post-Race Recovery

## Key Warnings
Any specific risks based on their profile (e.g., "Your longest run is 28K but you're racing a marathon — expect significant fatigue after 30K. Walk aid stations in the last 10K if needed.")

Be honest and direct. If their goal time is unrealistic given their training, say so and suggest a realistic alternative. Do not sugarcoat.`;

  const user = `Race: ${formData.distance}
Goal time: ${formData.goalTime}
Location: ${formData.location}
Date: ${formData.raceDate}
Elevation: ${formData.elevation}
Weather: ${formData.weather}, Humidity: ${formData.humidity}
Experience: ${formData.experience}
Weekly mileage: ${formData.weeklyMileage} ${formData.unit}
Longest recent run: ${formData.longestRun} ${formData.unit}
Sensitivities: ${formData.sensitivities.join(", ") || "None"}
Fuel preference: ${formData.fuelType}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
```

---

## 6. Strategy Output (`StrategyOutput.jsx`)

- Receives raw markdown string from the AI
- Renders it as formatted HTML using a simple markdown-to-JSX approach:
  - Parse `##` headers into styled section headers
  - Parse `|` tables into HTML tables with Tailwind styling
  - Parse `###` into subheaders
  - Parse `- ` into bullet lists
- Don't install a markdown library. Write a simple parser (~40 lines) or use `dangerouslySetInnerHTML` with a lightweight regex-based converter
- Add a "📋 Copy to Clipboard" button at the top that copies the raw markdown
- Add a "🔄 Regenerate" button that re-calls the API with same inputs

---

## 7. UI / Styling

### Layout

```
┌─────────────────────────────────────┐
│  🏃 RaceTrack AI          [⚙️ Key]   │  ← header
├─────────────────────────────────────┤
│                                     │
│  [Race Form]                        │  ← left/top on mobile
│                                     │
│  ─ ─ ─ ─ OR ─ ─ ─ ─               │
│                                     │
│  [Strategy Output]                  │  ← replaces form after submit
│                                     │
├─────────────────────────────────────┤
│  Free tool by @issa.exercise        │  ← footer
└─────────────────────────────────────┘
```

### Design Specs

- Mobile-first, single column. On desktop (>768px), form can be left panel with output on right
- Color palette: dark background (`#0f172a` slate-900), accent orange (`#f97316`), white text
- Font: system font stack (no imports)
- The form slides out or collapses once strategy is generated, with a "← Edit inputs" button to return
- Loading state: pulsing skeleton with "Generating your race plan..." text
- Subtle gradient on header: slate-900 to slate-800

### Responsive

- Mobile: stacked, full-width form inputs, strategy output scrolls full-page
- Desktop: 2-column layout, form stays visible alongside output

---

## 8. Deployment

```bash
# Build
npm run build

# Deploy to Vercel
npx vercel --prod
```

Set `VITE_DEFAULT_GROQ_KEY` as an environment variable in Vercel project settings.

Since this is a Vite static site with no server, Vercel's free tier handles it with zero config.

---

## 9. Edge Cases to Handle

1. **Empty goal time:** Default to "finish comfortably" and have the AI suggest a target
2. **Unrealistic goal:** The prompt explicitly asks the AI to flag this — trust the model
3. **Ultra distance:** If "Ultra" is selected, show a custom km input (50K, 80K, 100K, 100mi)
4. **Rate limit on default key:** Auto-open API key modal, don't show a generic error
5. **Network failure:** Show a retry button with "Check your connection" message
6. **Long response time:** Groq is fast (~2-4 seconds), but show the spinner after 500ms to avoid flicker

---

## 10. Future Enhancements (Not in V1)

- Export strategy as PDF
- Save past strategies to localStorage
- Weather API integration (auto-fill from location + date)
- Strava integration to pull training data
- Compare strategies across different goal times

---

## Summary

This is a single-page React app with ~6 component files. No backend. No database. No auth. The AI call goes directly from the browser to Groq's API. The entire build should take one Claude Code session.

The only architectural pattern that matters: **default API key → fallback to user key on rate limit → user can always set their own key.** This pattern should be extracted and reused across all @issa.exercise apps going forward.
