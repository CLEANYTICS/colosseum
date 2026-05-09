// src/lib/correlation.ts

export function computePearsonCorrelation(
  seriesA: number[],
  seriesB: number[]
): number | null {
  const n = Math.min(seriesA.length, seriesB.length)
  if (n < 5) return null

  const a = seriesA.slice(-n)
  const b = seriesB.slice(-n)

  const meanA = a.reduce((s, x) => s + x, 0) / n
  const meanB = b.reduce((s, x) => s + x, 0) / n

  let num = 0, denomA = 0, denomB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    num += da * db
    denomA += da * da
    denomB += db * db
  }

  const denom = Math.sqrt(denomA * denomB)
  if (denom === 0) return null
  return parseFloat((num / denom).toFixed(3))
}

export function alignSeries(
  a: Record<string, number>,
  b: Record<string, number>
): { valuesA: number[]; valuesB: number[] } {
  // Normalize keys to YYYY-MM-DD only (strip time/timezone)
  const normalizeDate = (d: string) => d.slice(0, 10)

  const normA: Record<string, number> = {}
  const normB: Record<string, number> = {}

  Object.entries(a).forEach(([k, v]) => { normA[normalizeDate(k)] = v })
  Object.entries(b).forEach(([k, v]) => { normB[normalizeDate(k)] = v })

  const sharedDates = Object.keys(normA)
    .filter(d => normB[d] != null)
    .sort()
    .slice(-30)

  return {
    valuesA: sharedDates.map(d => normA[d]),
    valuesB: sharedDates.map(d => normB[d]),
  }
}

export function interpretCorrelation(r: number | null, assetB: string): {
  label: string
  color: string
  interpretation: string
} {
  if (r === null) return {
    label: 'Insufficient data',
    color: '#999',
    interpretation: 'Not enough shared trading days to compute'
  }

  const abs = Math.abs(r)
  const direction = r >= 0 ? 'positive' : 'negative'

  if (abs >= 0.7) return {
    label: r >= 0 ? 'Strong coupling' : 'Strong inverse',
    color: r >= 0 ? '#0F6E56' : '#c0392b',
    interpretation: r >= 0
      ? `SOL moves tightly with ${assetB} — on-chain beta is high`
      : `SOL moves inversely to ${assetB} — acting as a hedge`
  }
  if (abs >= 0.4) return {
    label: r >= 0 ? 'Moderate coupling' : 'Moderate inverse',
    color: r >= 0 ? '#b07d00' : '#b07d00',
    interpretation: r >= 0
      ? `SOL partially tracks ${assetB} — macro narrative is influential but not dominant`
      : `SOL diverging from ${assetB} — on-chain capital rotating independently`
  }
  return {
    label: 'Decoupled',
    color: '#888',
    interpretation: `SOL showing independent price action from ${assetB} over 30 days`
  }
}