'use client'

import { useState, useRef, useEffect } from 'react'
import { PMHistoryPoint } from '@/services/kalshi'

const OUTCOME_COLORS: Record<string, string> = {
  'Cut 50+ bps': '#1a6b3c',
  'Cut 25 bps':  '#2d7a2d',
  'No change':   '#1a1a1a',
  'Hike 25 bps': '#c0392b',
  'Hike 50+ bps':'#8b0000',
}

const OUTCOMES = ['Cut 50+ bps', 'Cut 25 bps', 'No change', 'Hike 25 bps', 'Hike 50+ bps']
const KALSHI_COLOR = '#0D6B52'

interface MarketOdds {
  label: string
  probability: number
}

const WARSH_EVENTS = [
  { date: '2026-01-30', label: 'Warsh nominated', color: '#E24B4A' },
  { date: '2026-02-04', label: 'Senate hearing', color: '#534AB7' },
  { date: '2026-04-22', label: 'Confirmed', color: '#0D6B52' },
  { date: '2026-05-15', label: 'Powell exits', color: '#0D6B52' },
]

function HistoryChart({ polyHistory, kalshiHistory }: {
  polyHistory: PMHistoryPoint[]
  kalshiHistory: PMHistoryPoint[]
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; pm: string; kalshi: string; date: string } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !polyHistory.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const PAD = { top: 16, right: 16, bottom: 32, left: 40 }
    const CW = W - PAD.left - PAD.right
    const CH = H - PAD.top - PAD.bottom

    ctx.clearRect(0, 0, W, H)

    const allTs = [...polyHistory.map(d => d.t), ...kalshiHistory.map(d => d.t)]
    const minT = Math.min(...allTs)
    const maxT = Math.max(...allTs)

    const xScale = (t: number) => PAD.left + ((t - minT) / (maxT - minT)) * CW
    const yScale = (p: number) => PAD.top + CH - (p * CH)

    ctx.strokeStyle = '#e8e2d6'
    ctx.lineWidth = 0.5
    ;[0, 0.25, 0.5, 0.75, 1].forEach(p => {
      const y = yScale(p)
      ctx.beginPath()
      ctx.moveTo(PAD.left, y)
      ctx.lineTo(PAD.left + CW, y)
      ctx.stroke()
      ctx.fillStyle = '#9b8e80'
      ctx.font = '10px Georgia, serif'
      ctx.textAlign = 'right'
      ctx.fillText(`${(p * 100).toFixed(0)}%`, PAD.left - 4, y + 3)
    })

    ctx.fillStyle = '#9b8e80'
    ctx.font = '10px Georgia, serif'
    ctx.textAlign = 'center'
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const monthTs = [
      new Date('2026-01-01').getTime() / 1000,
      new Date('2026-02-01').getTime() / 1000,
      new Date('2026-03-01').getTime() / 1000,
      new Date('2026-04-01').getTime() / 1000,
      new Date('2026-05-01').getTime() / 1000,
      new Date('2026-06-01').getTime() / 1000,
    ]
    monthTs.forEach((ts, i) => {
      if (ts >= minT && ts <= maxT) {
        const x = xScale(ts)
        ctx.fillText(months[i], x, PAD.top + CH + 20)
        ctx.strokeStyle = '#e8e2d6'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(x, PAD.top)
        ctx.lineTo(x, PAD.top + CH)
        ctx.stroke()
      }
    })

    WARSH_EVENTS.forEach(ev => {
      const ts = new Date(ev.date).getTime() / 1000
      if (ts < minT || ts > maxT) return
      const x = xScale(ts)
      ctx.strokeStyle = ev.color
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(x, PAD.top)
      ctx.lineTo(x, PAD.top + CH)
      ctx.stroke()
      ctx.setLineDash([])
    })

    if (kalshiHistory.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = KALSHI_COLOR
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      kalshiHistory.forEach((d, i) => {
        const x = xScale(d.t)
        const y = yScale(d.p)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.setLineDash([])
    }

    if (polyHistory.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2
      polyHistory.forEach((d, i) => {
        const x = xScale(d.t)
        const y = yScale(d.p)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
  }, [polyHistory, kalshiHistory])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !polyHistory.length) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const W = canvas.clientWidth
    const PAD = { left: 40, right: 16 }
    const CW = W - PAD.left - PAD.right
    const allTs = [...polyHistory.map(d => d.t), ...kalshiHistory.map(d => d.t)]
    const minT = Math.min(...allTs)
    const maxT = Math.max(...allTs)
    const t = minT + ((mouseX - PAD.left) / CW) * (maxT - minT)
    const closest = (arr: PMHistoryPoint[]) =>
      arr.reduce((best, d) => Math.abs(d.t - t) < Math.abs(best.t - t) ? d : best, arr[0])
    const pm = polyHistory.length ? closest(polyHistory) : null
    const kalshi = kalshiHistory.length ? closest(kalshiHistory) : null
    if (pm || kalshi) {
      const date = new Date((pm || kalshi)!.t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      setTooltip({ x: mouseX, y: 20, pm: pm ? `${(pm.p * 100).toFixed(1)}%` : '—', kalshi: kalshi ? `${(kalshi.p * 100).toFixed(1)}%` : '—', date })
    }
  }

  return (
    <div style={{ position: 'relative', padding: '16px 0 8px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', paddingLeft: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#555', fontFamily: 'Georgia, serif' }}>
          <div style={{ width: '20px', height: '2px', backgroundColor: '#1a1a1a' }} />
          Polymarket
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#555', fontFamily: 'Georgia, serif' }}>
          <div style={{ width: '20px', height: '0', borderTop: `2px dashed ${KALSHI_COLOR}` }} />
          Kalshi
        </div>
        <div style={{ marginLeft: 'auto', paddingRight: '16px', fontSize: '11px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
          "No change" probability · Dec 2025 to Jun 2026
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        style={{ width: '100%', height: '200px', cursor: 'crosshair', display: 'block' }}
      />

      {tooltip && (
        <div style={{
          position: 'absolute', left: Math.min(tooltip.x + 8, 560), top: tooltip.y,
          backgroundColor: '#fff', border: '1px solid #ccc5b5',
          padding: '8px 12px', fontSize: '11px', fontFamily: 'Georgia, serif',
          pointerEvents: 'none', zIndex: 10,
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: '#1a1a1a' }}>{tooltip.date}</div>
          <div style={{ color: '#1a1a1a' }}>Polymarket: {tooltip.pm}</div>
          <div style={{ color: KALSHI_COLOR }}>Kalshi: {tooltip.kalshi}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingLeft: '40px', marginTop: '4px' }}>
        {WARSH_EVENTS.map(ev => (
          <div key={ev.date} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ev.color }} />
            {ev.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function OddsColumn({ title, volume, odds, noChangePct }: {
  title: string
  volume: string
  odds: MarketOdds[]
  noChangePct: string
}) {
  const oddsMap = Object.fromEntries(odds.map(o => [o.label, o.probability]))

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Georgia, serif', marginBottom: '2px' }}>
          {title}
        </div>
        <div style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
          {volume} volume
        </div>
      </div>

      {OUTCOMES.map(label => {
        const prob = oddsMap[label] ?? 0
        const pct = (prob * 100).toFixed(1)
        const color = OUTCOME_COLORS[label]
        const isMain = label === 'No change'

        return (
          <div key={label} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: '#555', fontFamily: 'Georgia, serif', fontWeight: isMain ? 600 : 400 }}>
                {label}
              </span>
              <span style={{ fontSize: isMain ? '16px' : '13px', fontWeight: isMain ? 700 : 500, color, fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' }}>
                {pct}%
              </span>
            </div>
            <div style={{ height: isMain ? '4px' : '3px', backgroundColor: '#e8e2d6', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${Math.min(parseFloat(pct), 100)}%`, backgroundColor: color, borderRadius: '2px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PredictionMarketsSection({
  polymarketOdds,
  kalshiOdds,
  polyHistory = [],
  kalshiHistory = [],
  title = 'Prediction Markets — Fed Decision June 2026',
  lastUpdated,
}: {
  polymarketOdds: MarketOdds[]
  kalshiOdds: MarketOdds[]
  polyHistory?: PMHistoryPoint[]
  kalshiHistory?: PMHistoryPoint[]
  title?: string
  lastUpdated?: string
}) {
  const [showHistory, setShowHistory] = useState(false)

  const polyNoChange = polymarketOdds.find(o => o.label === 'No change')?.probability ?? 0
  const kalshiNoChange = kalshiOdds.find(o => o.label === 'No change')?.probability ?? 0
  const bothAgree = Math.abs(polyNoChange - kalshiNoChange) < 0.05
  const avgProb = ((polyNoChange + kalshiNoChange) / 2 * 100).toFixed(1)
  const polyNoChangePct = (polyNoChange * 100).toFixed(1)
  const kalshiNoChangePct = (kalshiNoChange * 100).toFixed(1)

  return (
    <div style={{ marginBottom: '0' }}>

      {/* Section header */}
      <div style={{
        borderTop: '2px solid #1a1a1a', paddingTop: '12px', marginBottom: '0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: 'Georgia, serif', fontWeight: 600 }}>
          {title}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
              last updated {lastUpdated}
            </span>
          )}
          <button
            onClick={() => setShowHistory(h => !h)}
            style={{
              background: 'none', border: 'none',
              fontSize: '10px', color: showHistory ? '#1a1a1a' : '#9b8e80',
              cursor: 'pointer', fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em', textDecoration: 'underline',
            }}
          >
            {showHistory ? 'Hide history' : 'Show history'}
          </button>
        </div>
      </div>

      {/* High conviction callout */}
      {bothAgree && parseFloat(avgProb) >= 95 && (
        <div style={{
          marginTop: '12px', marginBottom: '4px',
          padding: '10px 16px',
          borderLeft: '3px solid #1a1a1a',
          backgroundColor: '#f5f3ef',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
            {avgProb}% probability of no change at June FOMC
          </span>
          <span style={{ fontSize: '11px', color: '#6b6055', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginLeft: '12px' }}>
            Polymarket and Kalshi converge — highest conviction signal of the cycle
          </span>
        </div>
      )}

      {/* History chart */}
      {showHistory && (
        <div style={{ borderBottom: '1px solid #e8e2d6', marginBottom: '16px' }}>
          <HistoryChart polyHistory={polyHistory} kalshiHistory={kalshiHistory} />
        </div>
      )}

      {/* Split columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
        <div style={{ borderRight: '1px solid #e8e2d6', paddingRight: '32px' }}>
          <OddsColumn title="Polymarket" volume="$18.5M" odds={polymarketOdds} noChangePct={polyNoChangePct} />
        </div>
        <div style={{ paddingLeft: '32px' }}>
          <OddsColumn title="Kalshi" volume="$2.9M" odds={kalshiOdds} noChangePct={kalshiNoChangePct} />
        </div>
      </div>

      {/* Convergence note */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid #e8e2d6' }}>
        {bothAgree ? (
          <span style={{ fontSize: '11px', color: '#0D6B52', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Both markets converge at {avgProb}% No change — high conviction signal
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: '#b07d00', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Markets diverging — watch for repricing
          </span>
        )}
      </div>
    </div>
  )
}
