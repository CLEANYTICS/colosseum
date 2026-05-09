'use client'

import { useState } from 'react'
import { UseCase, EventType } from '@/data/events'

const TYPE_COLORS: Record<EventType, string> = {
  bearish_shock:    '#E24B4A',
  nomination:       '#534AB7',
  policy_milestone: '#0F6E56',
  future:           '#185FA5',
}

function getPositionPct(date: string, minMs: number, maxMs: number): number {
  const t = new Date(date).getTime()
  return ((t - minMs) / (maxMs - minMs)) * 92 + 2
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
      months.push({
        label: cursor.toLocaleDateString('en-US', { month: 'short' }),
        pct
      })
    }
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return (
    <div style={{ marginBottom: '48px' }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Option D header */}
      <div style={{
        borderRadius: '4px 4px 0 0',
        overflow: 'hidden',
        border: '0.5px solid #ccc5b5',
        borderBottom: 'none',
      }}>
        <div style={{
          background: '#FFF1E5',
          padding: '10px 24px',
          borderBottom: '1px solid #ccc5b5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: '16px', fontWeight: '600', color: '#1a1a1a',
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            letterSpacing: '0.01em',
          }}>
            Narrative Timeline
          </span>
          <span style={{
            fontSize: '10px', color: '#9b8e80',
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
          }}>
            Click any event to expand
          </span>
        </div>
      </div>

      {/* Timeline body */}
      <div style={{
        border: '0.5px solid #ccc5b5',
        borderTop: 'none',
        borderRadius: '0 0 4px 4px',
        backgroundColor: '#FFFAF5',
        padding: '28px 32px 20px',
      }}>
        <div style={{ position: 'relative', height: '220px', padding: '0 8px' }}>

          {/* Axis */}
          <div style={{
            position: 'absolute', top: '120px', left: 0, right: 0,
            height: '1px', backgroundColor: '#ccc5b5'
          }} />

          {/* Month labels */}
          {months.map(m => (
            <div key={m.label + m.pct} style={{
              position: 'absolute', top: '128px', left: `${m.pct}%`,
              transform: 'translateX(-50%)',
              fontSize: '10px', color: '#b0a090',
              fontFamily: 'Georgia, serif',
              userSelect: 'none', letterSpacing: '0.05em',
            }}>
              {m.label}
            </div>
          ))}

          {/* TODAY marker */}
          {showToday && (
            <div style={{ position: 'absolute', left: `${todayPct}%`, top: '92px' }}>
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '8px', fontWeight: 600, letterSpacing: '0.12em',
                color: '#854F0B', backgroundColor: '#FAEEDA',
                padding: '2px 6px', borderRadius: '2px',
                whiteSpace: 'nowrap', fontFamily: 'Georgia, serif',
                textTransform: 'uppercase',
              }}>
                Today
              </div>
              <div style={{
                position: 'absolute', top: '16px', left: '50%',
                width: '1px', height: '26px',
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

            // Build border styles without mixing shorthand and longhand
            const cardBorderColor = isExpanded ? color + '44' : '#ccc5b5'
            const cardStyle: React.CSSProperties = {
              position: 'absolute',
              left: '-52px', width: '108px',
              top: above ? '-22px' : '8px',
              transform: above ? 'translateY(-100%)' : 'translateY(22px)',
              backgroundColor: isExpanded ? '#FFF8F2' : '#FFFAF5',
              borderTopWidth: '2px',
              borderTopStyle: isFuture ? 'dashed' : 'solid',
              borderTopColor: color,
              borderRightWidth: '0.5px',
              borderRightStyle: 'solid',
              borderRightColor: cardBorderColor,
              borderBottomWidth: '0.5px',
              borderBottomStyle: 'solid',
              borderBottomColor: cardBorderColor,
              borderLeftWidth: '0.5px',
              borderLeftStyle: 'solid',
              borderLeftColor: cardBorderColor,
              borderRadius: above ? '3px 3px 0 0' : '0 0 3px 3px',
              padding: '7px 9px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              zIndex: isExpanded ? 10 : 1,
              pointerEvents: 'auto',
            }

            return (
              <div key={event.id} style={{ position: 'absolute', left: `${pct}%`, top: '120px', pointerEvents: 'none' }}>

                {/* Dot */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  style={{
                    position: 'absolute',
                    top: '-5px', left: '-5px',
                    width: '10px', height: '10px',
                    borderRadius: '50%',
                    backgroundColor: isFuture ? 'transparent' : color,
                    border: isFuture ? `1.5px dashed ${color}` : isExpanded ? `2px solid ${color}` : 'none',
                    boxShadow: isExpanded ? `0 0 0 3px ${color}22` : 'none',
                    zIndex: 2, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    pointerEvents: 'auto',
                  }}
                />

                {/* Stem */}
                <div style={{
                  position: 'absolute', left: 0,
                  width: '1px', height: '22px',
                  top: above ? '-22px' : '8px',
                  background: isFuture
                    ? `repeating-linear-gradient(to bottom, ${color} 0px, ${color} 3px, transparent 3px, transparent 6px)`
                    : '#ccc5b5'
                }} />

                {/* Card */}
                <div onClick={() => setExpandedId(isExpanded ? null : event.id)} style={cardStyle}>
                  <div style={{
                    fontSize: '12px', fontWeight: 600,
                    color: '#1a1a1a',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    lineHeight: 1.3, marginBottom: '2px'
                  }}>
                    {event.label}
                  </div>
                  <div style={{
                    fontSize: '9px', color: '#b0a090',
                    fontFamily: 'Georgia, serif',
                    marginBottom: '3px', letterSpacing: '0.03em'
                  }}>
                    {dateLabel}
                  </div>
                  <div style={{
                    fontSize: '10px', color: '#6b6055',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontStyle: 'italic', lineHeight: 1.35
                  }}>
                    {event.description}
                  </div>
                  <div style={{
                    fontSize: '9px', color: '#c0b0a0',
                    fontFamily: 'Georgia, serif', marginTop: '5px',
                    letterSpacing: '0.02em'
                  }}>
                    {isFuture ? '◎ upcoming' : '↓ expand'}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
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
            borderTopWidth: '2px',
            borderTopStyle: 'solid',
            borderTopColor: color,
            borderRightWidth: '0.5px',
            borderRightStyle: 'solid',
            borderRightColor: '#ccc5b5',
            borderBottomWidth: '0.5px',
            borderBottomStyle: 'solid',
            borderBottomColor: '#ccc5b5',
            borderLeftWidth: '0.5px',
            borderLeftStyle: 'solid',
            borderLeftColor: '#ccc5b5',
            borderRadius: '0 0 4px 4px',
            backgroundColor: '#FFFAF5',
            padding: '24px 32px',
            marginTop: '0',
            animation: 'expandIn 0.2s ease',
          }}>
            <style>{`
              @keyframes expandIn {
                from { opacity: 0; transform: translateY(-8px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: '20px'
            }}>
              <div>
                <div style={{
                  fontSize: '10px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', color, fontWeight: 600,
                  fontFamily: 'Georgia, serif', marginBottom: '4px'
                }}>
                  {event.type.replace('_', ' ')}
                </div>
                <div style={{
                  fontSize: '22px', fontWeight: 700,
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  color: '#1a1a1a', marginBottom: '3px'
                }}>
                  {event.label}
                </div>
                <div style={{
                  fontSize: '12px', color: '#9b8e80',
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: 'italic'
                }}>
                  {dateLabel} · {event.description}
                </div>
              </div>
              <button
                onClick={() => setExpandedId(null)}
                style={{
                  background: 'none', border: '1px solid #ccc5b5',
                  borderRadius: '2px', padding: '4px 10px',
                  fontSize: '11px', color: '#9b8e80', cursor: 'pointer',
                  fontFamily: 'Georgia, serif'
                }}
              >
                ✕ close
              </button>
            </div>

            {isFuture ? (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fff',
                  borderLeftWidth: '3px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: color,
                  borderTopWidth: '0.5px',
                  borderTopStyle: 'solid',
                  borderTopColor: '#ccc5b5',
                  borderRightWidth: '0.5px',
                  borderRightStyle: 'solid',
                  borderRightColor: '#ccc5b5',
                  borderBottomWidth: '0.5px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: '#ccc5b5',
                }}>
                  <div style={{
                    fontSize: '10px', color: '#9b8e80',
                    fontFamily: 'Georgia, serif', marginBottom: '4px'
                  }}>
                    Prediction Markets
                  </div>
                  <div style={{
                    fontSize: '20px', fontWeight: 700, color,
                    fontFamily: '"Cormorant Garamond", Georgia, serif'
                  }}>
                    {noChangeProb != null
                      ? `${(noChangeProb * 100).toFixed(1)}% No Change`
                      : event.predictionMarketNote}
                  </div>
                  <div style={{
                    fontSize: '11px', color: '#9b8e80',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontStyle: 'italic', marginTop: '4px'
                  }}>
                    June FOMC · Warsh&apos;s first decision
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', color: '#b0a090',
                  fontFamily: 'Georgia, serif', marginBottom: '12px'
                }}>
                  Market Reaction · TradFi
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '10px'
                }}>
                  {event.assetReactions.map(r => (
                    <div key={r.ticker} style={{
                      backgroundColor: '#fff',
                      borderTopWidth: '2px',
                      borderTopStyle: 'solid',
                      borderTopColor: r.changePct >= 0 ? '#3B6D11' : '#A32D2D',
                      borderRightWidth: '0.5px',
                      borderRightStyle: 'solid',
                      borderRightColor: '#ccc5b5',
                      borderBottomWidth: '0.5px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#ccc5b5',
                      borderLeftWidth: '0.5px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: '#ccc5b5',
                      padding: '10px 12px',
                    }}>
                      <div style={{
                        fontSize: '10px', color: '#9b8e80',
                        fontFamily: 'Georgia, serif', marginBottom: '4px'
                      }}>
                        {r.label} · TradFi
                      </div>
                      <div style={{
                        fontSize: '20px', fontWeight: 700,
                        color: r.changePct >= 0 ? '#3B6D11' : '#A32D2D',
                        fontFamily: '"Cormorant Garamond", Georgia, serif'
                      }}>
                        {r.changePct >= 0 ? '+' : ''}{r.changePct}%
                      </div>
                    </div>
                  ))}
                  {event.assetReactions.length === 0 && (
                    <div style={{
                      fontSize: '13px', color: '#9b8e80',
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontStyle: 'italic'
                    }}>
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