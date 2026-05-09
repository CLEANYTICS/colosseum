// src/services/kalshi.ts

const KALSHI_BASE = 'https://api.elections.kalshi.com/trade-api/v2'

export interface KalshiMarketOdds {
  ticker: string
  label: string
  probability: number
}

export interface PMHistoryPoint {
  t: number
  p: number
}

const LABEL_MAP: Record<string, string> = {
  'KXFEDDECISION-26JUN-C26': 'Cut 50+ bps',
  'KXFEDDECISION-26JUN-C25': 'Cut 25 bps',
  'KXFEDDECISION-26JUN-H0':  'No change',
  'KXFEDDECISION-26JUN-H25': 'Hike 25 bps',
  'KXFEDDECISION-26JUN-H26': 'Hike 50+ bps',
}

const OUTCOME_ORDER = ['Cut 50+ bps', 'Cut 25 bps', 'No change', 'Hike 25 bps', 'Hike 50+ bps']

export async function fetchKalshiFedJuneOdds(): Promise<KalshiMarketOdds[]> {
  try {
    const response = await fetch(
      `${KALSHI_BASE}/events/KXFEDDECISION-26JUN`,
      { next: { revalidate: 60 } }
    )
    if (!response.ok) throw new Error(`Kalshi error ${response.status}`)
    const data = await response.json()
    const markets = data?.markets ?? []

    return markets
      .filter((m: any) => LABEL_MAP[m.ticker])
      .map((m: any) => ({
        ticker: m.ticker,
        label: LABEL_MAP[m.ticker],
        probability: (parseFloat(m.yes_bid_dollars) + parseFloat(m.yes_ask_dollars)) / 2,
      }))
      .sort((a: any, b: any) =>
        OUTCOME_ORDER.indexOf(a.label) - OUTCOME_ORDER.indexOf(b.label)
      )
  } catch (error) {
    console.error('Kalshi fetch error:', error)
    return []
  }
}

export async function fetchKalshiNoChangeHistory(): Promise<PMHistoryPoint[]> {
  try {
    const url = new URL(`${KALSHI_BASE}/series/KXFEDDECISION/markets/KXFEDDECISION-26JUN-H0/candlesticks`)
    url.searchParams.set('start_ts', '1734480000') // Dec 2025
    url.searchParams.set('end_ts', String(Math.floor(Date.now() / 1000)))
    url.searchParams.set('period_interval', '1440') // daily

    const response = await fetch(url.toString(), { next: { revalidate: 300 } })
    if (!response.ok) throw new Error(`Kalshi history error ${response.status}`)

    const data = await response.json()
    const candles = data?.candlesticks ?? []

    return candles
      .map((c: any) => {
        // Use close price if available, otherwise mid of bid/ask
        const closeDollars = c.price?.close_dollars
        const bidClose = c.yes_bid?.close_dollars
        const askClose = c.yes_ask?.close_dollars

        let p: number
        if (closeDollars) {
          p = parseFloat(closeDollars)
        } else if (bidClose && askClose) {
          p = (parseFloat(bidClose) + parseFloat(askClose)) / 2
        } else {
          return null
        }

        return { t: c.end_period_ts, p }
      })
      .filter(Boolean)
      .filter((d: PMHistoryPoint) => d.p > 0 && d.p <= 1)

  } catch (error) {
    console.error('Kalshi history error:', error)
    return []
  }
}
