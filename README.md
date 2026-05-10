# CLEANYTICS

**Real-time macro intelligence terminal connecting TradFi, prediction markets, and Solana onchain execution.**

Live at [cleanytics.vercel.app](https://cleanytics.vercel.app)

---

## The Warsh Effect

January 30th, 2026. Trump nominates Kevin Warsh as Fed Chair on a Friday afternoon. Gold drops 11%. Silver drops 37%, its worst single day since March 1980. Every TradFi broker closes for the weekend.

On Solana, XAG silver perps on Pacifica never stopped trading.

CLEANYTICS exists because macro events don't wait for market hours. It connects the signal to the trade. 24/7, onchain.

---

## What It Does

**Cross-Market Intelligence Table** live comparison of TradFi prices, Solana spot (via Jupiter), and Solana perps (via Pacifica) for equities, commodities, and FX. Shows real-time premium/discount gaps where Solana diverges from TradFi.

**Narrative Timeline** the Warsh Effect story told through macro events, with market reactions on expand. From the Jan 30 nomination through the June FOMC.

**Prediction Markets** live Fed decision probabilities from Polymarket and Kalshi with historical chart. Currently pricing 97%+ no change at June FOMC.

**Morning Brief** AI-synthesized audio briefing generated from live market data via Gemini and delivered via ElevenLabs. Bloomberg squawk style, no greeting, straight to the signal.

**Intelligence Brief** written AI synthesis of the day's macro signals, cross-market gaps, and what to watch.

**SOL Macro Beta** 30-day Pearson correlation of SOL vs Nasdaq and SOL vs 10Y yield, showing whether crypto is amplifying or ignoring the macro narrative.

**Public Signals API** REST endpoint at `/api/signals` returning live cross-market data for trading bot integration.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript |
| Deployment | Vercel |
| Solana spot prices | Jupiter API |
| Onchain data | Helius |
| Commodity/FX perps | Pacifica |
| Prediction markets | Polymarket CLOB, Kalshi |
| TradFi prices | Yahoo Finance |
| AI narrative | Google Gemini 2.5 Flash |
| AI audio | ElevenLabs Flash v2.5 |

---

## Signals API

Public REST endpoint, no auth required, CORS open.

```
GET https://cleanytics.vercel.app/api/signals
```

Returns:
- `predictionMarkets` Polymarket and Kalshi probabilities for all Fed outcomes
- `signals` all assets with TradFi, Solana spot, Solana perp, and gap analysis
- `notableSignals` filtered to gaps >= 0.5%, sorted by magnitude
- `meta` data sources and rate limit info

Revalidates every 60 seconds.

---

## Running Locally

```bash
git clone https://github.com/CLEANYTICS/colosseum
cd colosseum
npm install
```

Create `.env.local`:

```
GEMINI_KEY=your_gemini_key
NEXT_PUBLIC_ELEVENLABS_KEY=your_elevenlabs_key
JUPITER_API_KEY=your_jupiter_key
HELIUS_API_KEY=your_helius_key
```

```bash
npm run dev
```

---

## Why Solana

Speed, tokenized assets, and 24/7 uptime make Solana the only chain where this is possible right now. xStocks on Jupiter bring tokenized equities. Pacifica brings commodity and FX perps. Helius provides onchain intelligence. No other chain has the infrastructure to be a real macro trading venue.

When TradFi sleeps, Solana doesn't.

---

## Hackathon

Built for the [Colosseum Frontier Hackathon](https://frontier.colosseum.org) and Superteam Poland Demo Day, May 2026.

Integrations: Jupiter · Helius · Pacifica · ElevenLabs · Polymarket · Kalshi
