'use client'

import { computePearsonCorrelation, alignSeries, interpretCorrelation } from '@/lib/correlation'

interface Props {
  solHistory: Record<string, number>
  qqqHistory: Record<string, number>
  yieldHistory: Record<string, number>
  solPrice: number
  solChange24h: number
  lastUpdated?: string
}

function CorrelationCard({
  label, r, interpretation,
}: {
  label: string
  r: ReturnType<typeof interpretCorrelation>
  interpretation: string
}) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
        SOL vs {label}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums', fontFamily: 'Georgia, serif', marginBottom: '4px', lineHeight: 1 }}>
        {interpretation}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: r.color, fontFamily: 'Georgia, serif', marginBottom: '6px' }}>
        {r.label}
      </div>
      <div style={{ fontSize: '11px', color: '#6b6055', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>
        {r.interpretation}
      </div>
    </div>
  )
}

export default function SolBetaSection({ solHistory, qqqHistory, yieldHistory, solPrice, solChange24h, lastUpdated }: Props) {
  const { valuesA: solVsQqq_sol, valuesB: solVsQqq_qqq } = alignSeries(solHistory, qqqHistory)
  const { valuesA: solVsYield_sol, valuesB: solVsYield_yield } = alignSeries(solHistory, yieldHistory)

  const rQqq = computePearsonCorrelation(solVsQqq_sol, solVsQqq_qqq)
  const rYield = computePearsonCorrelation(solVsYield_sol, solVsYield_yield)

  const qqqInterp = interpretCorrelation(rQqq, 'Nasdaq')
  const yieldInterp = interpretCorrelation(rYield, '10Y Yield')

  const isPositive = solChange24h >= 0

  return (
    <div style={{ marginBottom: '0' }}>

      <div style={{
        borderTop: '2px solid #1a1a1a', paddingTop: '12px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: 'Georgia, serif', fontWeight: 600 }}>
          SOL Macro Beta
        </span>
        <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
          30-day Pearson correlation{lastUpdated ? ` · last updated ${lastUpdated}` : ''}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e8e2d6' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>SOL</span>
        <span style={{ fontSize: '24px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
          ${solPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: isPositive ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif' }}>
          {isPositive ? '▲' : '▼'} {Math.abs(solChange24h).toFixed(2)}%
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#9b8e80', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
          Solana native asset · highest liquidity on-chain proxy for macro beta
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0', paddingBottom: '20px', borderBottom: '1px solid #e8e2d6' }}>
        <div style={{ flex: 1, borderRight: '1px solid #e8e2d6', paddingRight: '32px' }}>
          <CorrelationCard label="Nasdaq 100 (QQQ)" r={qqqInterp} interpretation={rQqq !== null ? rQqq.toFixed(2) : '—'} />
        </div>
        <div style={{ flex: 1, paddingLeft: '32px' }}>
          <CorrelationCard label="US 10Y Yield" r={yieldInterp} interpretation={rYield !== null ? rYield.toFixed(2) : '—'} />
        </div>
      </div>

      <p style={{
        marginTop: '16px', fontSize: '12px', color: '#6b6055',
        fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.7,
        borderLeft: '2px solid #ccc5b5', paddingLeft: '16px',
      }}>
        SOL as macro beta: crypto-native capital reprices Solana faster than TradFi reprices equities.
        A rising SOL-Nasdaq correlation under a hawkish Fed signals on-chain markets are not decoupling —
        they are amplifying the same rate-sensitivity narrative.
      </p>
    </div>
  )
}
