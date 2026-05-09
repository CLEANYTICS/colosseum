'use client'

import { useEffect, useRef } from 'react'
import { MacroEvent, EventType } from '@/data/events'

const EVENT_COLORS: Record<EventType, string> = {
  bearish_shock:    '#E24B4A',
  nomination:       '#534AB7',
  policy_milestone: '#0F6E56',
  future:           '#185FA5',
}

interface PriceSeries {
  ticker: string
  label: string
  color: string
  data: Record<string, number>  // { 'YYYY-MM-DD': price }
}

interface Props {
  series: PriceSeries[]
  events: MacroEvent[]
  title?: string
}

export default function HistoryChart({ series, events, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || series.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = 260
    canvas.width = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const PAD = { top: 20, right: 24, bottom: 40, left: 56 }
    const chartW = W - PAD.left - PAD.right
    const chartH = H - PAD.top - PAD.bottom

    // Collect all dates across all series
    const allDates = [...new Set(series.flatMap(s => Object.keys(s.data)))].sort()
    if (allDates.length === 0) return

    // Normalize each series to % change from first value (index = 0)
    const normalized = series.map(s => ({
      ...s,
      points: allDates.map(d => {
        const keys = Object.keys(s.data).sort()
        const firstVal = s.data[keys[0]]
        const val = s.data[d]
        return val != null && firstVal ? ((val - firstVal) / firstVal) * 100 : null
      })
    }))

    const allValues = normalized.flatMap(s => s.points.filter((v): v is number => v != null))
    const minVal = Math.min(...allValues, 0)
    const maxVal = Math.max(...allValues, 0)
    const valRange = maxVal - minVal || 1

    const xScale = (i: number) => PAD.left + (i / (allDates.length - 1)) * chartW
    const yScale = (v: number) => PAD.top + chartH - ((v - minVal) / valRange) * chartH

    // Clear
    ctx.clearRect(0, 0, W, H)

    // Grid lines + Y labels
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 0.5
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const v = minVal + (valRange / gridLines) * i
      const y = yScale(v)
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke()
      ctx.fillStyle = '#aaa'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'right'
      ctx.fillText((v >= 0 ? '+' : '') + v.toFixed(1) + '%', PAD.left - 6, y + 3)
    }

    // Zero line
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    const zeroY = yScale(0)
    ctx.beginPath(); ctx.moveTo(PAD.left, zeroY); ctx.lineTo(W - PAD.right, zeroY); ctx.stroke()
    ctx.setLineDash([])

    // Event vertical lines
    events.forEach(event => {
      const dateIdx = allDates.findIndex(d => d >= event.date.slice(0, 10))
      if (dateIdx < 0) return
      const ex = xScale(dateIdx)
      const color = EVENT_COLORS[event.type]
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.setLineDash(event.type === 'future' ? [4, 3] : [])
      ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.moveTo(ex, PAD.top); ctx.lineTo(ex, PAD.top + chartH); ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      // Event label (short)
      ctx.fillStyle = color
      ctx.font = '9px system-ui'
      ctx.textAlign = 'center'
      ctx.save()
      ctx.translate(ex + 3, PAD.top + 8)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(event.label.slice(0, 16), 0, 0)
      ctx.restore()
    })

    // Price series lines
    normalized.forEach(s => {
      ctx.strokeStyle = s.color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      let started = false
      s.points.forEach((v, i) => {
        if (v == null) return
        const x = xScale(i)
        const y = yScale(v)
        if (!started) { ctx.moveTo(x, y); started = true }
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    })

    // X axis — monthly labels
    ctx.fillStyle = '#aaa'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    let lastMonth = ''
    allDates.forEach((d, i) => {
      const month = d.slice(0, 7)
      if (month !== lastMonth) {
        lastMonth = month
        const label = new Date(d).toLocaleDateString('en-US', { month: 'short' })
        ctx.fillText(label, xScale(i), H - PAD.bottom + 16)
      }
    })

    // Legend
    let legendX = PAD.left
    series.forEach(s => {
      ctx.strokeStyle = s.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(legendX, H - 8)
      ctx.lineTo(legendX + 16, H - 8)
      ctx.stroke()
      ctx.fillStyle = '#666'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText(s.label, legendX + 20, H - 4)
      legendX += s.label.length * 7 + 40
    })

  }, [series, events])

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #e8e4dc',
      marginBottom: '40px'
    }}>
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid #e8e4dc',
        display: 'flex', alignItems: 'center', gap: '8px',
        backgroundColor: '#faf9f7'
      }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1a1a1a' }} />
        <div style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', fontWeight: 600 }}>
          {title ?? 'Historical Price Context'}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '10px', color: '#bbb' }}>
          % change from period start · Event markers overlay
        </div>
      </div>
      <div style={{ padding: '16px 24px 8px' }}>
        <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
      </div>
    </div>
  )
}