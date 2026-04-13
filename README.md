# Savify

Savify is a mobile-first personal finance assistant with guided money insights, a personalized investment cockpit, and a policy hub that analyzes insurance documents.

## Key Features

- Investment cockpit that derives income, expenses, and savings from signup + transactions, then calculates safe-to-invest, emergency fund status, and risk tier.
- Actionable allocation split with expandable rationale for each bucket.
- Live market cards with refresh, profile-fit badges, and expandable details.
- Investment log with running total and gain/loss summary.
- Policy hub with personalized policy feed, policy detail analyzer, and habit-matched policy list.
- Policy upload analyzer that extracts plan details and plain-English insights.

## Tech Stack

- React 18 + Vite
- Zustand (persisted local state)
- Tailwind CSS
- Framer Motion
- Lucide React
- Node.js + Express (server proxy for document and market analysis)

## Quick Start

1) Install dependencies
```bash
npm install
```

2) Start the web app
```bash
npm run dev
```

## Server Setup (Policy Analyzer + Market Summary)

The app uses a local server for policy document analysis and market summary data.

1) Set the API keys in your shell environment
```bash
set OPENAI_API_KEY=your_key_here
set ALPHAVANTAGE_API_KEY=your_key_here
```

2) Run the server
```bash
npm run server
```

The web app proxies API calls to the server at `http://localhost:5174`.

## Routes

- `/` Dashboard
- `/transactions` Transactions feed
- `/investments` Personalized investment cockpit
- `/insurance` Policy hub feed
- `/insurance/:policyId` Policy detail + upload analyzer
- `/insurance/habits` Habit-matched policy list
- `/profile` Profile + insurance snapshot editor