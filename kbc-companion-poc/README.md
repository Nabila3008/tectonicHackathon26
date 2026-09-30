# KBC Companion — Hackathon PoC

AI-first proactive financial companion for the KBC Hackathon. Personalized demographic budgets, empathic monthly spending alerts, travel anomaly detection, and destination sub-budgets — with live demo controls for the pitch.

## Quick start

```bash
cd kbc-companion-poc
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Windows note (Application Control)

If native Next.js SWC binaries are blocked on your machine, use the WASM fallback scripts:

```bash
npm run dev:wasm
# or
npm run build:wasm
```

A portable Node runtime can also live under `.tools/` (ignored by git) if system Node is unavailable.

## Pitch flow (≈2 min)

1. Click **Open demo profiles** → choose **Married parent of two**.
2. Show the monthly pace banner and category framework.
3. Click **Simulate flight purchase** (Rome).
4. In the Companion sidebar, confirm the vacation → review the destination daily budget.
5. Optionally switch to **Single young professional** to contrast demographics.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind CSS
- Mock engines: budget, anomaly detection, AI companion dialogue

## Project structure

```
src/
  app/                 # layout + page
  components/          # UI
  context/AppContext.tsx
  lib/
    budget-engine.ts   # demographic baseline + monthly pace
    anomaly.ts         # flight/hotel detection + trip budgets
    ai-companion.ts    # proactive messages & actions
    mock-data.ts       # presets + transactions
  types/
```

## Features mapped

| Requirement | Implementation |
|---|---|
| Demographic onboarding | `OnboardingForm` + AI budget confirmation |
| Personalized baseline | `suggestAnnualBudget` / `buildMonthlyBudget` |
| Proactive spend alerts | `buildSpendingAlert` + banner + chat |
| Travel anomaly → trip budget | `detectAnomaly` + `buildDestinationBudget` |
| Demo controls | Profile presets + simulate flight/hotel |
