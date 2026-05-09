'use client'

import { useState } from 'react'
import { UseCase, EventType, MacroEvent } from '@/data/events'

const TYPE_COLORS: Record<EventType, string> = {
  bearish_shock:    '#c0392b',
  nomination:       '#534AB7',
  policy_milestone: '#0D6B52',
  future:           '#9b8e80',
}

function getPositionPct(date: string, minMs: number, maxMs: number): number {
  const t = new Date(date).getTime()
  return ((t - minMs) / (maxMs - minMs)) * 92 + 2
}

function getBubbleSize(event: MacroEvent): number {
  if (event.type === 'future') return 10
  if (event.assetReactions.length === 0) return 10
  const maxImpact = Math.max(...event.assetReactions.map(r => Math.abs(r.changePct)))
  // Scale: 0% = 8px, 5% = 14px, 10% = 20px, 40% = 32px
  const size = Math.min(8 + maxImpact * 0.7, 36)
  return Math.max(size, 8)
}

function getBubbleTooltip(event: MacroEvent): string {
  if (event.assetReactions.length === 0) return ''
  return event.assetReactions
    .map(r => `${r.label}: ${r.changePct >= 0 ? '+' : ''}${r.changePct}%`)
    .join(' · ')
}

export default function TimelineSection({
  useCase,
  noChangeProb,
}: {
  useCase: UseCase
  noChangeProb?: number
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const dates = useCase.events.map(e => new Date(e.date).getTime())
  const minMs = Math.min(...dates)
  const maxMs = Math.max(...dates)

  const today = new Date()
  const todayPct = Math.round(getPositionPct(today.toISOString(), minMs, maxMs) * 100) / 100
  const showToday = todayPct > 2 && todayPct < 94

  const months: { label: string; pct: number }[] = []
  const cursor = new Date(minMs)
  cursor.setDate(1)
  while (cursor.getTime() <= maxMs) {
    const pct = getPositionPct(cursor.toISOString(), minMs, maxMs)
    if (pct >= 0 && pct <= 100) {
      months.push({ label: cursor.toLocaleDateString('en-US', { month: 'short' }), pct })
    }
    cursor.setMonth(cursor.getMonth() + 1)
  }

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
        <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: 'Georgia, serif', fontWeight: 600 }}>
          Narrative Timeline
        </span>
        <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Bubble size = market impact · click to expand
        </span>
      </div>

      {/* Bubble legend */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { type: 'bearish_shock', label: 'Bearish shock' },
          { type: 'nomination', label: 'Nomination' },
          { type: 'policy_milestone', label: 'Policy milestone' },
          { type: 'future', label: 'Upcoming' },
        ].map(({ type, label }) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: type === 'future' ? 'transparent' : TYPE_COLORS[type as EventType],
              border: type === 'future' ? `1.5px dashed ${TYPE_COLORS.future}` : 'none',
            }} />
            {label}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ padding: '8px 0 20px', position: 'relative', height: '240px' }}>

        {/* Timeline line */}
        <div style={{ position: 'absolute', top: '120px', left: 0, right: 0, height: '1px', backgroundColor: '#ccc5b5' }} />

        {/* Month labels */}
        {months.map(m => (
          <div key={m.label + m.pct} style={{
            position: 'absolute', top: '90px', left: `${m.pct}%`,
            transform: 'translateX(-50%)',
            fontSize: '10px', color: '#9b8e80',
            fontFamily: 'Georgia, serif', userSelect: 'none'
          }}>
            {m.label}
          </div>
        ))}

        {/* Today marker */}
        {showToday && (
          <div style={{ position: 'absolute', left: `${todayPct}%`, top: '92px' }}>
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px', fontWeight: 600, letterSpacing: '0.1em',
              color: '#854F0B', backgroundColor: '#FAEEDA',
              padding: '1px 5px', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif'
            }}>
              Today
            </div>
            <div style={{
              position: 'absolute', top: '14px', left: '50%',
              width: '1px', height: '28px',
              background: 'repeating-linear-gradient(to bottom, #BA7517 0px, #BA7517 3px, transparent 3px, transparent 6px)'
            }} />
          </div>
        )}

        {/* Events */}
        {useCase.events.map((event, i) => {
          const pct = getPositionPct(event.date, minMs, maxMs)
          const above = i % 2 === 0
          const color = TYPE_COLORS[event.type]
          const isFuture = event.type === 'future'
          const dateLabel = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          const isExpanded = expandedId === event.id
          const bubbleSize = getBubbleSize(event)
          const tooltip = getBubbleTooltip(event)

          return (
            <div key={event.id} style={{ position: 'absolute', left: `${pct}%`, top: '120px', pointerEvents: 'none' }}>

              {/* Bubble */}
              <div
                title={tooltip}
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                style={{
                  position: 'absolute',
                  top: `-${bubbleSize / 2}px`,
                  left: `-${bubbleSize / 2}px`,
                  width: `${bubbleSize}px`,
                  height: `${bubbleSize}px`,
                  borderRadius: '50%',
                  backgroundColor: isFuture ? 'transparent' : color,
                  border: isFuture ? `1.5px dashed ${color}` : isExpanded ? `2px solid #1a1a1a` : 'none',
                  opacity: isFuture ? 0.6 : 0.85,
                  zIndex: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'auto',
                  boxShadow: isExpanded ? `0 0 0 3px ${color}33` : 'none',
                }}
              />

              {/* Stem */}
              <div style={{
                position: 'absolute',
                left: 0,
                width: '1px',
                height: '22px',
                top: above ? `-${bubbleSize / 2 + 22}px` : `${bubbleSize / 2}px`,
                background: isFuture
                  ? `repeating-linear-gradient(to bottom, ${color} 0px, ${color} 3px, transparent 3px, transparent 6px)`
                  : '#ccc5b5'
              }} />

              {/* Card */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                style={{
                  position: 'absolute',
                  left: `-52px`,
                  width: '104px',
                  top: above ? `-${bubbleSize / 2 + 22}px` : `${bubbleSize / 2}px`,
                  transform: above ? 'translateY(-100%)' : `translateY(22px)`,
                  backgroundColor: isExpanded ? '#faf9f7' : '#fff',
                  borderTop: `2px ${isFuture ? 'dashed' : 'solid'} ${color}`,
                  border: `1px solid ${isExpanded ? color + '44' : '#e8e2d6'}`,
                  borderTopColor: color,
                  padding: '6px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  zIndex: isExpanded ? 10 : 1,
                  pointerEvents: 'auto',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Georgia, serif', lineHeight: 1.3, marginBottom: '2px' }}>
                  {event.label}
                </div>
                <div style={{ fontSize: '9px', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '2px' }}>
                  {dateLabel}
                </div>
                <div style={{ fontSize: '10px', color: '#6b6055', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: 1.3 }}>
                  {event.description}
                </div>
                {/* Impact hint */}
                {event.assetReactions.length > 0 && (
                  <div style={{ fontSize: '9px', color: color, fontFamily: 'Georgia, serif', marginTop: '3px', fontWeight: 600 }}>
                    {event.assetReactions[0].label} {event.assetReactions[0].changePct >= 0 ? '+' : ''}{event.assetReactions[0].changePct}%
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#ccc', fontFamily: 'Georgia, serif', marginTop: '2px' }}>
                  {isFuture ? '◎ upcoming' : '↓ expand'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Expanded Panel */}
      {expandedId && (() => {
        const event = useCase.events.find(e => e.id === expandedId)
        if (!event) return null

        const color = TYPE_COLORS[event.type]
        const isFuture = event.type === 'future'
        const dateLabel = new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })

        return (
          <div style={{
            borderTop: `2px solid ${color}`,
            backgroundColor: '#faf9f7',
            padding: '24px 0',
            animation: 'expandIn 0.2s ease',
          }}>
            <style>{`
              @keyframes expandIn {
                from { opacity: 0; transform: translateY(-8px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color, fontWeight: 600, fontFamily: 'Georgia, serif', marginBottom: '4px' }}>
                  {event.type.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Georgia, serif', color: '#1a1a1a', marginBottom: '2px' }}>
                  {event.label}
                </div>
                <div style={{ fontSize: '12px', color: '#9b8e80', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  {dateLabel} · {event.description}
                </div>
              </div>
              <button
                onClick={() => setExpandedId(null)}
                style={{ background: 'none', border: '1px solid #e8e2d6', padding: '4px 10px', fontSize: '11px', color: '#9b8e80', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
              >
                ✕ close
              </button>
            </div>

            {isFuture ? (
              <div>
                <div style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Prediction Markets
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color, fontFamily: 'Georgia, serif' }}>
                  {noChangeProb != null ? `${(noChangeProb * 100).toFixed(1)}% No Change` : event.predictionMarketNote}
                </div>
                <div style={{ fontSize: '11px', color: '#9b8e80', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: '4px' }}>
                  June FOMC · Warsh's first decision
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '12px' }}>
                  Market Reaction · TradFi
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {event.assetReactions.map(r => (
                    <div key={r.ticker} style={{ borderTop: `2px solid ${r.changePct >= 0 ? '#0D6B52' : '#c0392b'}`, paddingTop: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '4px' }}>
                        {r.label} · TradFi
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: r.changePct >= 0 ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif' }}>
                        {r.changePct >= 0 ? '+' : ''}{r.changePct}%
                      </div>
                    </div>
                  ))}
                  {event.assetReactions.length === 0 && (
                    <div style={{ fontSize: '12px', color: '#9b8e80', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                      Markets had already priced this in.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
