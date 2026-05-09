// src/components/PacificaPerpsSection.tsx

import { PacificaMarket } from '@/services/pacifica'

const SYMBOL_META: Record<string, {
  label: string
  description: string
  tradeUrl: string
  leverage: string
  macroContext: string
}> = {
  GOLD: {
    label: 'Gold',
    description: 'XAU perpetual',
    tradeUrl: 'https://app.pacifica.fi/trade/GOLD',
    leverage: '10x',
    macroContext: 'Real yield proxy. Falls when Warsh raises rates. Watch for pressure as June FOMC approaches.',
  },
  XAG: {
    label: 'Silver',
    description: 'XAG perpetual',
    tradeUrl: 'https://app.pacifica.fi/trade/SILVER',
    leverage: '10x',
    macroContext: 'Dropped 37% on Jan 30 when Warsh was nominated. Most volatile macro asset on Solana.',
  },
  CL: {
    label: 'WTI Oil',
    description: 'CL perpetual',
    tradeUrl: 'https://app.pacifica.fi/trade/CL',
    leverage: '10x',
    macroContext: 'Oil above $100 is keeping inflation elevated — the core reason Warsh will hold rates in June.',
  },
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

export default function PacificaPerpsSection({
  markets,
}: {
  markets: PacificaMarket[]
}) {
  if (!markets.length) return null

  return (
    <div style={{ marginBottom: '0' }}>

      {/* Section header */}
      <div style={{
        borderTop: '2px solid #1a1a1a',
        paddingTop: '12px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}>
        <span style={{
          fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#1a1a1a', fontFamily: 'Georgia, serif', fontWeight: 600,
        }}>
          Macro Perps · Pacifica
        </span>
        <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
          Solana · 24/7 · up to 10x leverage · no broker
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 110px 80px 100px 100px 80px 1fr',
        gap: '16px', paddingBottom: '8px',
        fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#9b8e80', borderBottom: '1px solid #ccc5b5',
        fontFamily: 'Georgia, serif',
      }}>
        <span>Asset</span>
        <span>Mark Price</span>
        <span>24h</span>
        <span>Volume 24h</span>
        <span>Open Interest</span>
        <span>Funding</span>
        <span>Context</span>
      </div>

      {markets.map((market, idx) => {
        const meta = SYMBOL_META[market.symbol]
        if (!meta) return null

        const isPositive = market.changePct >= 0
        const fundingPositive = market.fundingRate >= 0

        return (
          <div key={market.symbol} style={{
            display: 'grid',
            gridTemplateColumns: '140px 110px 80px 100px 100px 80px 1fr',
            gap: '16px', padding: '16px 0',
            borderBottom: idx < markets.length - 1 ? '1px solid #e8e2d6' : 'none',
            alignItems: 'center',
          }}>

            {/* Asset */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                {meta.label}
              </div>
              <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                {meta.description} · {meta.leverage}
              </div>
            </div>

            {/* Mark price */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                {market.mark.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                oracle {market.oracle.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* 24h change */}
            <div style={{
              fontSize: '12px', fontWeight: 500,
              color: isPositive ? '#0D6B52' : '#c0392b',
              fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums',
            }}>
              {isPositive ? '▲' : '▼'} {Math.abs(market.changePct).toFixed(2)}%
            </div>

            {/* Volume */}
            <div style={{ fontSize: '12px', color: '#1a1a1a', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' }}>
              {formatVolume(market.volume24h)}
            </div>

            {/* Open interest */}
            <div style={{ fontSize: '12px', color: '#1a1a1a', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' }}>
              {formatVolume(market.openInterest)}
            </div>

            {/* Funding rate */}
            <div style={{
              fontSize: '11px',
              color: fundingPositive ? '#0D6B52' : '#c0392b',
              fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums',
            }}>
              {fundingPositive ? '+' : ''}{(market.fundingRate * 100).toFixed(4)}%
            </div>

            {/* Context + CTA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ fontSize: '11px', color: '#6b6055', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.6, flex: 1 }}>
                {meta.macroContext}
              </div>
              <a
                href={meta.tradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #1a1a1a',
                  color: '#1a1a1a',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'Georgia, serif',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Trade →
              </a>
            </div>

          </div>
        )
      })}

      {/* Footer */}
      <div style={{
        paddingTop: '12px',
        borderTop: '1px solid #e8e2d6',
        fontSize: '10px', color: '#9b8e80',
        fontFamily: 'Georgia, serif', fontStyle: 'italic',
      }}>
        Perpetual futures · Pacifica · Solana · Prices update every 60s · Not financial advice
      </div>
    </div>
  )
}
