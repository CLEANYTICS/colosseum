'use client'

import { useState, useEffect, useRef } from 'react'
import { SolanaAssetData } from '@/services/solana'
import { PacificaMarket } from '@/services/pacifica'

type Category = 'all' | 'equities' | 'commodities' | 'fx'

interface HistoricalReaction {
  eventLabel: string
  eventDate: string
  changePct: number
}

interface CrossMarketAsset {
  id: string
  label: string
  category: 'equities' | 'commodities' | 'fx'
  sentiment: 'bullish' | 'bearish' | 'watch'
  tradfiTicker?: string
  solanaMint?: string
  solanaSpotLabel?: string
  jupiterPair?: string
  pacificaSymbol?: string
  pacificaUrl?: string
  showGap: boolean
  watchNote: string
  historicalReactions: HistoricalReaction[]
}

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const ASSETS: CrossMarketAsset[] = [
  {
    id: 'spy', label: 'S&P 500', category: 'equities', sentiment: 'bearish',
    tradfiTicker: 'SPY',
    solanaMint: 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W', solanaSpotLabel: 'SPYx',
    jupiterPair: 'SPYx-USDC',
    showGap: true,
    watchNote: 'Higher rates compress equity multiples — future earnings are worth less today. Watch for multiple compression as June FOMC approaches and Warsh signals his policy path.',
    historicalReactions: [],
  },
  {
    id: 'qqq', label: 'Nasdaq 100', category: 'equities', sentiment: 'bearish',
    tradfiTicker: 'QQQ',
    solanaMint: 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ', solanaSpotLabel: 'QQQx',
    jupiterPair: 'QQQx-USDC',
    showGap: true,
    watchNote: 'Tech stocks are long-duration assets — most sensitive to rate changes. If Warsh signals a higher-for-longer path, Nasdaq takes the biggest hit. Watch QQQx premium/discount as an early signal.',
    historicalReactions: [],
  },
  {
    id: 'gold', label: 'Gold', category: 'commodities', sentiment: 'bearish',
    tradfiTicker: 'GC=F',
    pacificaSymbol: 'XAU', pacificaUrl: 'https://app.pacifica.fi/trade/GOLD',
    showGap: true,
    watchNote: 'Gold is a real yield proxy — it falls when rates rise and inflation expectations drop. Under a hawkish Warsh path, rising real yields make holding gold less attractive. Watch for gold to weaken as June FOMC approaches.',
    historicalReactions: [
      { eventLabel: 'Warsh nomination', eventDate: 'Jan 30', changePct: -11.37 },
      { eventLabel: 'Senate hearing', eventDate: 'Feb 4', changePct: -2.1 },
      { eventLabel: 'Senate confirmation', eventDate: 'Apr 22', changePct: -1.4 },
    ],
  },
  {
    id: 'silver', label: 'Silver', category: 'commodities', sentiment: 'bearish',
    tradfiTicker: 'SI=F',
    pacificaSymbol: 'XAG', pacificaUrl: 'https://app.pacifica.fi/trade/SILVER',
    showGap: false,
    watchNote: 'Silver fell 37% on Jan 30 — its worst day since March 1980. More volatile than gold as both a safe haven and industrial metal. XAG on Pacifica is the only place to trade silver 24/7 on Solana.',
    historicalReactions: [
      { eventLabel: 'Warsh nomination', eventDate: 'Jan 30', changePct: -37.0 },
    ],
  },
  {
    id: 'oil', label: 'WTI Oil', category: 'commodities', sentiment: 'watch',
    tradfiTicker: 'CL=F',
    pacificaSymbol: 'CL', pacificaUrl: 'https://app.pacifica.fi/trade/CL',
    showGap: true,
    watchNote: 'Oil above $100 is the core reason Warsh will hold rates in June — it keeps inflation elevated. Watch CL for any break below $90 which would change the inflation narrative and open the door to cuts.',
    historicalReactions: [
      { eventLabel: 'Oil crosses $100', eventDate: 'Mar 18', changePct: 3.1 },
    ],
  },
  {
    id: 'eurusd', label: 'EUR/USD', category: 'fx', sentiment: 'bearish',
    tradfiTicker: 'EURUSD=X',
    pacificaSymbol: 'EURUSD', pacificaUrl: 'https://app.pacifica.fi/trade/EURUSD',
    showGap: true,
    watchNote: 'Dollar strengthens when US rates rise relative to other countries. Warsh signals a wider rate differential vs ECB — dollar bullish, EUR/USD bearish. Watch for a break below 1.15 as confirmation.',
    historicalReactions: [],
  },
  {
    id: 'usdjpy', label: 'USD/JPY', category: 'fx', sentiment: 'bullish',
    tradfiTicker: 'JPY=X',
    pacificaSymbol: 'USDJPY', pacificaUrl: 'https://app.pacifica.fi/trade/USDJPY',
    showGap: true,
    watchNote: 'Yen weakness signals capital flowing toward higher-yield dollar assets. BoJ still ultra-dovish while Warsh is hawkish — widening rate differential pushes USD/JPY higher. Watch for 160+ as a signal.',
    historicalReactions: [],
  },
]

const SENTIMENT_COLORS = {
  bullish: '#0D6B52',
  bearish: '#c0392b',
  watch: '#b07d00',
}

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (p >= 10) return p.toFixed(2)
  return p.toFixed(4)
}

declare global {
  interface Window { Jupiter: any }
}

function JupiterModal({ asset, onClose }: {
  asset: CrossMarketAsset
  onClose: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const containerId = `jupiter-modal-${asset.id}`

  useEffect(() => {
    function init() {
      if (!window.Jupiter || initialized.current) return
      initialized.current = true
      window.Jupiter.init({
        displayMode: 'integrated',
        integratedTargetId: containerId,
        formProps: {
          initialInputMint: USDC_MINT,
          initialOutputMint: asset.solanaMint,
        },
      })
    }

    if (window.Jupiter) {
      setTimeout(init, 50)
    } else if (!document.getElementById('jupiter-plugin-script')) {
      const script = document.createElement('script')
      script.id = 'jupiter-plugin-script'
      script.src = 'https://plugin.jup.ag/plugin-v1.js'
      script.setAttribute('data-preload', '')
      script.defer = true
      script.onload = () => setTimeout(init, 50)
      document.head.appendChild(script)
    } else {
      const interval = setInterval(() => {
        if (window.Jupiter) { clearInterval(interval); setTimeout(init, 50) }
      }, 200)
    }
  }, [asset.solanaMint, containerId])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFF1E5',
          width: '100%', maxWidth: '420px',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Modal header */}
        <div style={{
          borderTop: '2px solid #1a1a1a',
          padding: '16px 20px 12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          borderBottom: '1px solid #e8e2d6',
        }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b8e80', marginBottom: '4px' }}>
              Trade on Solana
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>
              {asset.solanaSpotLabel ?? asset.label}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              fontSize: '11px', color: '#9b8e80',
              cursor: 'pointer', fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em',
            }}
          >
            close
          </button>
        </div>

        {/* Jupiter widget */}
        <div
          id={containerId}
          ref={containerRef}
          style={{ width: '100%', minHeight: '380px' }}
        />

        {/* Modal footer */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid #e8e2d6',
          fontSize: '9px', color: '#9b8e80', fontStyle: 'italic',
        }}>
          Powered by Jupiter · 0.5% platform fee via CLEANYTICS · Not financial advice
        </div>
      </div>
    </div>
  )
}

export default function CrossMarketTable({
  tradfiMap,
  changePctMap,
  solanaPrices,
  pacificaMarkets,
}: {
  tradfiMap: Record<string, number>
  changePctMap: Record<string, number>
  solanaPrices: Record<string, SolanaAssetData>
  pacificaMarkets: PacificaMarket[]
}) {
  const [category, setCategory] = useState<Category>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tradeAsset, setTradeAsset] = useState<CrossMarketAsset | null>(null)

  const pacificaMap = Object.fromEntries(pacificaMarkets.map(m => [m.symbol, m]))

  const enriched = ASSETS.map(a => ({
    ...a,
    tradfiPrice: a.tradfiTicker ? tradfiMap[a.tradfiTicker] : undefined,
    tradfiChangePct: a.tradfiTicker ? changePctMap[a.tradfiTicker] : undefined,
    solanaSpotData: a.solanaMint ? solanaPrices[a.solanaMint] : undefined,
    pacificaData: a.pacificaSymbol ? pacificaMap[a.pacificaSymbol] : undefined,
  }))

  const filtered = enriched.filter(a => category === 'all' || a.category === category)

  const CATEGORY_FILTERS: { id: Category; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'equities', label: 'Equities' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'fx', label: 'FX' },
  ]

  return (
    <>
      {/* Jupiter trade modal */}
      {tradeAsset && (
        <JupiterModal asset={tradeAsset} onClose={() => setTradeAsset(null)} />
      )}

      <div style={{ marginBottom: '0' }}>

        {/* Section header */}
        <div style={{
          borderTop: '2px solid #1a1a1a', paddingTop: '12px', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: 'Georgia, serif', fontWeight: 600 }}>
            Cross-Market Intelligence
          </span>
          <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
            TradFi · Solana Spot · Solana Perps · click any row
          </span>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '16px' }}>
          {CATEGORY_FILTERS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => setCategory(f.id)}
              style={{
                background: 'none',
                border: '1px solid #ccc5b5',
                borderRight: i < CATEGORY_FILTERS.length - 1 ? 'none' : '1px solid #ccc5b5',
                padding: '5px 14px',
                fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: category === f.id ? '#fff' : '#9b8e80',
                backgroundColor: category === f.id ? '#1a1a1a' : 'transparent',
                cursor: 'pointer', fontFamily: 'Georgia, serif', transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '130px 120px 160px 160px 90px 20px',
          gap: '16px', paddingBottom: '8px',
          fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#9b8e80', borderBottom: '1px solid #ccc5b5', fontFamily: 'Georgia, serif',
        }}>
          <span>Asset</span>
          <span>TradFi</span>
          <span style={{ color: '#0D6B52' }}>Solana Spot</span>
          <span style={{ color: '#0D6B52' }}>Solana Perp</span>
          <span>Gap</span>
          <span />
        </div>

        {filtered.map((asset, idx) => {
          const isExpanded = expandedId === asset.id
          const tradfiPos = (asset.tradfiChangePct ?? 0) >= 0
          const solanaSpotPos = (asset.solanaSpotData?.priceChange24h ?? 0) >= 0
          const pacificaPos = (asset.pacificaData?.changePct ?? 0) >= 0
          const sentimentColor = SENTIMENT_COLORS[asset.sentiment]

          let gapPct: number | null = null
          let gapLabel = ''
          if (asset.showGap) {
            const tradfi = asset.tradfiPrice
            const solana = asset.solanaSpotData?.price ?? asset.pacificaData?.mark ?? null
            if (tradfi && solana) {
              gapPct = ((solana - tradfi) / tradfi) * 100
              gapLabel = gapPct >= 0 ? 'premium' : 'discount'
            }
          }

          return (
            <div key={asset.id}>
              {/* Main row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : asset.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '130px 120px 160px 160px 90px 20px',
                  gap: '16px', padding: '14px 0',
                  borderBottom: !isExpanded ? (idx < filtered.length - 1 ? '1px solid #e8e2d6' : 'none') : 'none',
                  alignItems: 'center', cursor: 'pointer',
                  borderLeft: `2px solid ${isExpanded ? sentimentColor : 'transparent'}`,
                  paddingLeft: isExpanded ? '10px' : '0',
                  transition: 'all 0.15s',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: isExpanded ? sentimentColor : '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                    {asset.label}
                  </div>
                  <div style={{ fontSize: '9px', color: '#9b8e80', marginTop: '2px', fontFamily: 'Georgia, serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {asset.category}
                  </div>
                </div>

                <div>
                  {asset.tradfiPrice ? (
                    <>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                        {formatPrice(asset.tradfiPrice)}
                      </div>
                      {asset.tradfiChangePct !== undefined && (
                        <div style={{ fontSize: '10px', marginTop: '2px', color: tradfiPos ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif' }}>
                          {tradfiPos ? '▲' : '▼'} {Math.abs(asset.tradfiChangePct).toFixed(2)}%
                        </div>
                      )}
                    </>
                  ) : <div style={{ fontSize: '11px', color: '#ccc5b5', fontFamily: 'Georgia, serif' }}>—</div>}
                </div>

                <div>
                  {asset.solanaSpotData ? (
                    <>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                        {formatPrice(asset.solanaSpotData.price)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#0D6B52', marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                        {asset.solanaSpotLabel} · spot
                      </div>
                      {asset.solanaSpotData.priceChange24h !== null && (
                        <div style={{ fontSize: '10px', color: solanaSpotPos ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif' }}>
                          {solanaSpotPos ? '▲' : '▼'} {Math.abs(asset.solanaSpotData.priceChange24h).toFixed(2)}%
                        </div>
                      )}
                    </>
                  ) : <div style={{ fontSize: '11px', color: '#ccc5b5', fontFamily: 'Georgia, serif' }}>—</div>}
                </div>

                <div>
                  {asset.pacificaData ? (
                    <>
                      <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                        {formatPrice(asset.pacificaData.mark)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#0D6B52', marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                        {asset.pacificaSymbol} · perp · 10x
                      </div>
                      <div style={{ fontSize: '10px', color: pacificaPos ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif' }}>
                        {pacificaPos ? '▲' : '▼'} {Math.abs(asset.pacificaData.changePct).toFixed(2)}%
                      </div>
                    </>
                  ) : <div style={{ fontSize: '11px', color: '#ccc5b5', fontFamily: 'Georgia, serif' }}>—</div>}
                </div>

                <div>
                  {gapPct !== null ? (
                    <>
                      <div style={{
                        fontSize: '13px', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                        color: Math.abs(gapPct) < 0.3 ? '#9b8e80' : gapPct >= 0 ? '#0D6B52' : '#c0392b',
                        fontFamily: 'Georgia, serif',
                      }}>
                        {gapPct >= 0 ? '+' : ''}{gapPct.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
                        {gapLabel}
                      </div>
                    </>
                  ) : <div style={{ fontSize: '11px', color: '#ccc5b5', fontFamily: 'Georgia, serif' }}>—</div>}
                </div>

                <div style={{ fontSize: '12px', color: '#9b8e80', textAlign: 'right' }}>
                  {isExpanded ? '↑' : '↓'}
                </div>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div style={{
                  borderTop: `1px solid ${sentimentColor}22`,
                  borderBottom: idx < filtered.length - 1 ? '1px solid #e8e2d6' : 'none',
                  backgroundColor: '#faf9f7',
                  padding: '20px 0 20px 12px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '32px',
                }}>
                  {/* Left — thesis */}
                  <div>
                    <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '10px' }}>
                      What to watch · {asset.label}
                    </div>
                    <p style={{ fontSize: '13px', color: '#4a4035', fontFamily: 'Georgia, serif', lineHeight: 1.7, margin: '0 0 16px' }}>
                      {asset.watchNote}
                    </p>

                    {asset.historicalReactions.length > 0 && (
                      <>
                        <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '10px', paddingTop: '12px', borderTop: '1px solid #e8e2d6' }}>
                          Warsh era signal · how it already reacted
                        </div>
                        {asset.historicalReactions.map((r, i) => (
                          <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 0', borderBottom: '1px solid #e8e2d6',
                          }}>
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>{r.eventLabel}</div>
                              <div style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>{r.eventDate}</div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: r.changePct >= 0 ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' }}>
                              {r.changePct >= 0 ? '+' : ''}{r.changePct}%
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Right — Trade */}
                  <div style={{ borderLeft: '1px solid #e8e2d6', paddingLeft: '32px' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: 'Georgia, serif', marginBottom: '16px' }}>
                      Trade
                    </div>

                    {/* Jupiter spot swap button */}
                    {asset.solanaMint && (
                      <div style={{ marginBottom: asset.pacificaUrl ? '16px' : '0' }}>
                        <div style={{ fontSize: '11px', color: '#4a4035', fontFamily: 'Georgia, serif', marginBottom: '10px', lineHeight: 1.6 }}>
                          {asset.solanaSpotLabel} trades on Solana — same exposure as {asset.label}, 24/7, instant settlement.
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setTradeAsset(asset) }}
                          style={{
                            width: '100%', padding: '11px 16px',
                            backgroundColor: '#1a1a1a', color: '#fff',
                            border: 'none',
                            fontSize: '11px', fontWeight: 600,
                            fontFamily: 'Georgia, serif', letterSpacing: '0.08em',
                            textTransform: 'uppercase', cursor: 'pointer',
                          }}
                        >
                          Swap {asset.solanaSpotLabel} on Jupiter
                        </button>
                        <div style={{ fontSize: '9px', color: '#9b8e80', fontFamily: 'Georgia, serif', marginTop: '6px', fontStyle: 'italic' }}>
                          0.5% platform fee via CLEANYTICS
                        </div>
                      </div>
                    )}

                    {/* Pacifica perp link */}
                    {asset.pacificaUrl && (
                      <div style={{ borderTop: asset.solanaMint ? '1px solid #e8e2d6' : 'none', paddingTop: asset.solanaMint ? '16px' : '0' }}>
                        <div style={{ fontSize: '11px', color: '#4a4035', fontFamily: 'Georgia, serif', marginBottom: '10px', lineHeight: 1.6 }}>
                          {asset.pacificaSymbol} perp on Pacifica — up to 10x leverage, 24/7.
                        </div>
                        <a
                          href={asset.pacificaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: 'block', padding: '11px 16px', textAlign: 'center',
                            backgroundColor: 'transparent', color: '#1a1a1a',
                            border: '1px solid #1a1a1a',
                            fontSize: '11px', fontWeight: 600,
                            fontFamily: 'Georgia, serif', textDecoration: 'none',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                          }}
                        >
                          Open {asset.pacificaSymbol} on Pacifica
                        </a>
                        <div style={{ fontSize: '9px', color: '#9b8e80', fontFamily: 'Georgia, serif', marginTop: '6px', fontStyle: 'italic' }}>
                          Not financial advice
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Footer */}
        <div style={{
          paddingTop: '12px', borderTop: '1px solid #e8e2d6',
          display: 'flex', justifyContent: 'space-between',
          fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif', fontStyle: 'italic',
        }}>
          <span>Spot via Jupiter · Perps via Pacifica · TradFi via Yahoo Finance</span>
          <span>Gap = Solana vs TradFi · not financial advice</span>
        </div>
      </div>
    </>
  )
}
