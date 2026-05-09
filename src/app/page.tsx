// src/app/page.tsx
import { fetchEventProbabilities, fetchPolymarketNoChangeHistory } from '@/services/polymarket'
import { fetchTradFiPrice, fetchTradFiHistory } from '@/services/tradfi'
import { fetchSolanaPrices, XSTOCK_LIQUID, SOLANA_ASSETS } from '@/services/solana'
import { generateNarrative } from '@/services/llm'
import { fetchKalshiFedJuneOdds, fetchKalshiNoChangeHistory } from '@/services/kalshi'
import { fetchPacificaPerps } from '@/services/pacifica'
import { enrichEventReactions } from '@/lib/enrichEvents'
import { WARSH_ERA } from '@/data/events'

import Masthead from '@/components/Masthead'
import StickyAudioBriefing from '@/components/StickyAudioBriefing'
import SolanaAdvantageCard from '@/components/SolanaAdvantageCard'
import TimelineSection from '@/components/TimelineSection'
import PredictionMarketsSection from '@/components/PredictionMarketsSection'
import CrossMarketTable from '@/components/CrossMarketTable'
import SolBetaSection from '@/components/SolBetaSection'

const CREAM = '#FFF1E5'
const WHITE = '#FFFFFF'
const PAD = '32px 64px'

const FED_EVENT_SLUG = 'fed-decision-in-june-825'

const CONDITION_IDS: Record<string, { conditionId: string; color: string }> = {
  'Cut 50+ bps': { conditionId: '0x4e4a7df876b0c04f0b8b29b9073eddfbaf5c787192da825ae7ca1031bc8cfd15', color: '#1a6b3c' },
  'Cut 25 bps':  { conditionId: '0xdde06286a7b9464d344f410ab0b3d2ebc6469904e72c27fd982f65fdbf78768d', color: '#2d7a2d' },
  'No change':   { conditionId: '0xde04b189b3f19eaccda02529a3ea67abfc46bff5c0c8fc42d8a2d0ed7b8f0d41', color: '#1a1a1a' },
  'Hike 25 bps': { conditionId: '0xa7cb4135c6d9c36da0e343874dd5b455de739c6d1b9f9f5583dd9320aacf5db2', color: '#c0392b' },
  'Hike 50+ bps':{ conditionId: '0xb01e70a56199a6d5467f47a2b94e75e7c7218c128c8d0b8beb6dafed2f0d15c2', color: '#8b0000' },
}

export type Sentiment = 'bullish' | 'bearish' | 'watch' | 'neutral'

const MACRO_ASSETS = [
  { id: 'gold',  label: 'Gold',         ticker: 'GC=F',      sentiment: 'bearish' as Sentiment, sentimentReason: 'Hawkish Fed raises real yields — opportunity cost of holding gold rises' },
  { id: 'dxy',   label: 'DXY',          ticker: 'DX-Y.NYB',  sentiment: 'bullish' as Sentiment, sentimentReason: 'Dollar strengthens as Warsh signals tighter policy path' },
  { id: 'us10y', label: 'US 10Y Yield', ticker: '^TNX',      sentiment: 'watch'   as Sentiment, sentimentReason: 'Rising yield confirms hawkish repricing — watch for 4.5% breakout' },
  { id: 'spy',   label: 'S&P 500',      ticker: 'SPY',       sentiment: 'bearish' as Sentiment, sentimentReason: 'Higher rates compress equity multiples — broad market under pressure' },
  { id: 'qqq',   label: 'Nasdaq 100',   ticker: 'QQQ',       sentiment: 'bearish' as Sentiment, sentimentReason: 'High duration tech assets most sensitive to rate path — most exposed' },
  { id: 'us2y',  label: 'US 2Y Yield',  ticker: '^IRX',      sentiment: 'watch'   as Sentiment, sentimentReason: 'Purest market pricing of Fed policy path — moves before the 10Y confirms conviction' },
  { id: 'vix',   label: 'VIX',          ticker: '^VIX',      sentiment: 'watch'   as Sentiment, sentimentReason: 'Low VIX + rising yields = fragile calm. Rising VIX = stress building under the surface' },
]

const DIVERGENCE_ASSETS = [
  { id: 'spyx', label: 'S&P 500',    ticker: 'SPY', solanaMint: XSTOCK_LIQUID.SPYX, solanaLabel: 'SPYx', noiseThreshold: 0.3 },
  { id: 'qqqx', label: 'Nasdaq 100', ticker: 'QQQ', solanaMint: XSTOCK_LIQUID.QQQX, solanaLabel: 'QQQx', noiseThreshold: 0.3 },
]

const ALL_TICKERS = [...new Set([
  ...MACRO_ASSETS.map(a => a.ticker),
  ...DIVERGENCE_ASSETS.map(a => a.ticker),
  'CL=F', 'EURUSD=X', 'JPY=X', 'SI=F',
])]

export default async function Home() {
  const [
    probabilities,
    kalshiOdds,
    polyHistory,
    kalshiHistory,
    pacificaPerps,
    solanaPrices,
    goldHistory,
    dxyHistory,
    silverHistory,
    solHistory,
    qqqHistory,
    yieldHistory,
    ...tradfiPrices
  ] = await Promise.all([
    fetchEventProbabilities(FED_EVENT_SLUG),
    fetchKalshiFedJuneOdds(),
    fetchPolymarketNoChangeHistory(),
    fetchKalshiNoChangeHistory(),
    fetchPacificaPerps(),
    fetchSolanaPrices(),
    fetchTradFiHistory('GC=F', '6mo'),
    fetchTradFiHistory('DX-Y.NYB', '6mo'),
    fetchTradFiHistory('SI=F', '6mo'),
    fetchTradFiHistory('SOL-USD', '2mo'),
    fetchTradFiHistory('QQQ', '2mo'),
    fetchTradFiHistory('^TNX', '2mo'),
    ...ALL_TICKERS.map(t => fetchTradFiPrice(t))
  ])

  const tradfiMap: Record<string, number> = {}
  const changePctMap: Record<string, number> = {}
  ALL_TICKERS.forEach((ticker, i) => {
    const data = tradfiPrices[i]
    if (data) {
      tradfiMap[ticker] = data.price
      changePctMap[ticker] = data.change_pct
    }
  })

  const noChangeProb = probabilities[CONDITION_IDS['No change'].conditionId] ?? 0

  const enrichedEvents = await enrichEventReactions(
    WARSH_ERA.events,
    { 'GC=F': goldHistory, 'DX-Y.NYB': dxyHistory, 'SI=F': silverHistory }
  )
  const enrichedUseCase = { ...WARSH_ERA, events: enrichedEvents }

  const narrative = await generateNarrative({
    useCaseTitle: 'The Warsh Era — Fed Chair Transition',
    useCaseDescription: 'Kevin Warsh replacing Powell as Fed Chair. First FOMC meeting June 16-17. Warsh seen as hawkish and dollar-friendly. Oil above $100 keeping inflation elevated.',
    predictionMarkets: Object.entries(CONDITION_IDS).map(([label, { conditionId }]) => ({
      label, probability: probabilities[conditionId] ?? 0
    })),
    tradfiPrices: MACRO_ASSETS.map(a => ({
      label: a.label, price: tradfiMap[a.ticker] ?? 0, changePct: changePctMap[a.ticker] ?? 0
    })),
    divergences: DIVERGENCE_ASSETS.map(a => ({
      label: a.label,
      tradfiPrice: tradfiMap[a.ticker] ?? 0,
      solanaPrice: solanaPrices[a.solanaMint]?.price ?? 0,
      divergencePct: tradfiMap[a.ticker] && solanaPrices[a.solanaMint]?.price
        ? ((solanaPrices[a.solanaMint].price - tradfiMap[a.ticker]) / tradfiMap[a.ticker]) * 100
        : 0,
      solanaLabel: a.solanaLabel
    }))
  })

  return (
    <main style={{
      fontFamily: 'Georgia, "Times New Roman", serif',
      backgroundColor: CREAM,
      minHeight: '100vh',
      color: '#1a1a1a',
    }}>

      {/* Sticky audio */}
      {narrative && <StickyAudioBriefing narrative={narrative} />}


      {/* Masthead */}
      <Masthead useCaseTitle="The Warsh Era · Fed Chair Transition" />

      {/* Solana Advantage · cream */}
      <SolanaAdvantageCard />

      {/* Timeline · white */}
      <div style={{ backgroundColor: WHITE, padding: PAD }}>
        <TimelineSection useCase={enrichedUseCase} noChangeProb={noChangeProb} />
      </div>

            {/* Cross-Market View · white */}
      <div style={{ backgroundColor: WHITE, padding: PAD }}>
        <CrossMarketTable
          tradfiMap={tradfiMap}
          changePctMap={changePctMap}
          solanaPrices={solanaPrices}
          pacificaMarkets={pacificaPerps}
        />
      </div>

      {/* Prediction Markets · cream */}
      <div style={{ backgroundColor: CREAM, padding: PAD }}>
        <PredictionMarketsSection
          polymarketOdds={Object.entries(CONDITION_IDS).map(([label, { conditionId }]) => ({
            label, probability: probabilities[conditionId] ?? 0
          }))}
          kalshiOdds={kalshiOdds}
          polyHistory={polyHistory}
          kalshiHistory={kalshiHistory}
        />
      </div>

      {/* Intelligence Brief · white */}
      {narrative && (
        <div style={{ backgroundColor: WHITE, padding: PAD }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#6b6055', marginBottom: '20px', fontFamily: 'Georgia, serif',
            borderTop: '2px solid #1a1a1a', paddingTop: '12px',
          }}>
            Intelligence Brief
          </div>
          {narrative.split('\n\n').filter(p => p.trim()).map((paragraph, i) => (
            <p key={i} style={{
              fontSize: '14px', lineHeight: '1.9', color: '#4a4035',
              margin: '0 0 18px 0', fontFamily: 'Georgia, serif',
              maxWidth: '760px',
            }}>
              {paragraph.replace(/\*\*/g, '').trim()}
            </p>
          ))}
        </div>
      )}


      {/* SOL Macro Beta · cream */}
      <div style={{ backgroundColor: CREAM, padding: PAD }}>
        <SolBetaSection
          solHistory={solHistory}
          qqqHistory={qqqHistory}
          yieldHistory={yieldHistory}
          solPrice={solanaPrices[SOLANA_ASSETS.SOL]?.price ?? 0}
          solChange24h={solanaPrices[SOLANA_ASSETS.SOL]?.priceChange24h ?? 0}
        />
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '16px 64px',
        fontSize: '11px', color: '#6b6055',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'Georgia, serif',
      }}>
        <span>Data: Polymarket · Kalshi · Yahoo Finance · Jupiter · Pacifica · Helius · Gemini AI · ElevenLabs</span>
        <span style={{ color: '#9b8e80' }}>CLEANYTICS © 2026</span>
      </div>

    </main>
  )
}
