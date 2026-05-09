// src/app/api/signals/route.ts
import { NextResponse } from 'next/server'
import { fetchTradFiPrice } from '@/services/tradfi'
import { fetchSolanaPrices, XSTOCK_LIQUID, SOLANA_ASSETS } from '@/services/solana'
import { fetchPacificaPerps } from '@/services/pacifica'
import { fetchEventProbabilities } from '@/services/polymarket'
import { fetchKalshiFedJuneOdds } from '@/services/kalshi'

const FED_EVENT_SLUG = 'fed-decision-in-june-825'

const CONDITION_IDS: Record<string, string> = {
  'Cut 50+ bps': '0x4e4a7df876b0c04f0b8b29b9073eddfbaf5c787192da825ae7ca1031bc8cfd15',
  'Cut 25 bps':  '0xdde06286a7b9464d344f410ab0b3d2ebc6469904e72c27fd982f65fdbf78768d',
  'No change':   '0xde04b189b3f19eaccda02529a3ea67abfc46bff5c0c8fc42d8a2d0ed7b8f0d41',
  'Hike 25 bps': '0xa7cb4135c6d9c36da0e343874dd5b455de739c6d1b9f9f5583dd9320aacf5db2',
  'Hike 50+ bps':'0xb01e70a56199a6d5467f47a2b94e75e7c7218c128c8d0b8beb6dafed2f0d15c2',
}

const CROSS_MARKET_ASSETS = [
  { id: 'spy',    label: 'S&P 500',    tradfiTicker: 'SPY',      solanaMint: XSTOCK_LIQUID.SPYX, solanaLabel: 'SPYx', pacificaSymbol: null },
  { id: 'qqq',    label: 'Nasdaq 100', tradfiTicker: 'QQQ',      solanaMint: XSTOCK_LIQUID.QQQX, solanaLabel: 'QQQx', pacificaSymbol: null },
  { id: 'gold',   label: 'Gold',       tradfiTicker: 'GC=F',     solanaMint: null,               solanaLabel: null,   pacificaSymbol: 'XAU' },
  { id: 'silver', label: 'Silver',     tradfiTicker: 'SI=F',     solanaMint: null,               solanaLabel: null,   pacificaSymbol: 'XAG' },
  { id: 'oil',    label: 'WTI Oil',    tradfiTicker: 'CL=F',     solanaMint: null,               solanaLabel: null,   pacificaSymbol: 'CL' },
  { id: 'eurusd', label: 'EUR/USD',    tradfiTicker: 'EURUSD=X', solanaMint: null,               solanaLabel: null,   pacificaSymbol: 'EURUSD' },
  { id: 'usdjpy', label: 'USD/JPY',    tradfiTicker: 'JPY=X',    solanaMint: null,               solanaLabel: null,   pacificaSymbol: 'USDJPY' },
]

export async function GET() {
  try {
    const [probabilities, kalshiOdds, solanaPrices, pacificaMarkets, ...tradfiPrices] = await Promise.all([
      fetchEventProbabilities(FED_EVENT_SLUG),
      fetchKalshiFedJuneOdds(),
      fetchSolanaPrices(),
      fetchPacificaPerps(),
      ...CROSS_MARKET_ASSETS.map(a => fetchTradFiPrice(a.tradfiTicker)),
    ])

    const pacificaMap = Object.fromEntries(pacificaMarkets.map(m => [m.symbol, m]))

    // Prediction markets
    const predictionMarkets = {
      polymarket: Object.entries(CONDITION_IDS).map(([label, conditionId]) => ({
        outcome: label,
        probability: probabilities[conditionId] ?? 0,
      })),
      kalshi: kalshiOdds.map(o => ({
        outcome: o.label,
        probability: o.probability,
      })),
      consensus: {
        noChangeProbability: probabilities[CONDITION_IDS['No change']] ?? 0,
        bothMarketsAgree: true,
        signal: 'hold',
      }
    }

    // Cross-market signals
    const signals = CROSS_MARKET_ASSETS.map((asset, i) => {
      const tradfi = tradfiPrices[i]
      const solanaSpot = asset.solanaMint ? solanaPrices[asset.solanaMint] : null
      const perp = asset.pacificaSymbol ? pacificaMap[asset.pacificaSymbol] : null

      // Compute gap
      let gap: number | null = null
      let gapSignal: string | null = null
      const tradfiPrice = tradfi?.price ?? null
      const solanaPrice = solanaSpot?.price ?? perp?.mark ?? null

      if (tradfiPrice && solanaPrice) {
        gap = ((solanaPrice - tradfiPrice) / tradfiPrice) * 100
        if (Math.abs(gap) < 0.3) gapSignal = 'tracking'
        else if (gap > 0) gapSignal = 'solana_premium'
        else gapSignal = 'solana_discount'
      }

      return {
        id: asset.id,
        label: asset.label,
        tradfi: tradfi ? {
          price: tradfi.price,
          changePct24h: tradfi.change_pct,
          ticker: asset.tradfiTicker,
        } : null,
        solanaSpot: solanaSpot ? {
          price: solanaSpot.price,
          changePct24h: solanaSpot.priceChange24h,
          liquidity: solanaSpot.liquidity,
          label: asset.solanaLabel,
          mint: asset.solanaMint,
        } : null,
        solanaPerp: perp ? {
          mark: perp.mark,
          oracle: perp.oracle,
          changePct24h: perp.changePct,
          fundingRate: perp.fundingRate,
          volume24h: perp.volume24h,
          openInterest: perp.openInterest,
          symbol: perp.symbol,
          leverage: '10x',
          exchange: 'Pacifica',
        } : null,
        gap: gap !== null ? {
          pct: parseFloat(gap.toFixed(4)),
          signal: gapSignal,
          description: gapSignal === 'solana_premium'
            ? 'Solana pricing higher than TradFi — on-chain markets more bullish'
            : gapSignal === 'solana_discount'
            ? 'Solana pricing lower than TradFi — on-chain markets more bearish'
            : 'Solana tracking TradFi closely — no significant divergence',
        } : null,
      }
    })

    // Notable signals — filter to meaningful gaps
    const notableSignals = signals
      .filter(s => s.gap && Math.abs(s.gap.pct) >= 0.5)
      .sort((a, b) => Math.abs(b.gap!.pct) - Math.abs(a.gap!.pct))

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      useCase: 'Warsh Era — Fed Chair Transition',
      predictionMarkets,
      signals,
      notableSignals,
      meta: {
        description: 'CLEANYTICS cross-market intelligence API. Returns live TradFi, Solana spot, and Solana perp prices with gap analysis.',
        docs: 'https://cleanytics.vercel.app/api/signals',
        dataSources: ['Polymarket', 'Kalshi', 'Yahoo Finance', 'Jupiter', 'Pacifica', 'Helius'],
        rateLimit: 'Revalidates every 60 seconds',
      }
    }, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      }
    })

  } catch (error) {
    console.error('Signals API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch signals' }, { status: 500 })
  }
}
