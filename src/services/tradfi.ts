// src/services/tradfi.ts
// Direct Yahoo Finance API — no Python backend needed

export interface TradFiPrice {
  ticker: string
  price: number
  change_pct: number
  previous_close: number
}

// Yahoo Finance ticker mapping — some tickers need adjustment
function toYahooTicker(ticker: string): string {
  return ticker // Yahoo uses the same format
}

export async function fetchTradFiPrice(ticker: string): Promise<TradFiPrice | null> {
  try {
    const yticker = toYahooTicker(ticker)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yticker)}?interval=1d&range=2d`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 60 }
    })

    if (!res.ok) throw new Error(`Yahoo Finance error ${res.status} for ${ticker}`)

    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) throw new Error(`No data for ${ticker}`)

    const meta = result.meta
    const price = meta.regularMarketPrice ?? meta.previousClose
    const previousClose = meta.previousClose ?? price
    const changePct = previousClose ? ((price - previousClose) / previousClose) * 100 : 0

    return {
      ticker,
      price,
      change_pct: changePct,
      previous_close: previousClose,
    }
  } catch (error) {
    console.error(`Error fetching TradFi price for ${ticker}:`, error)
    return null
  }
}

export async function fetchTradFiHistory(
  ticker: string,
  period: string = '1mo'
): Promise<Record<string, number>> {
  try {
    const yticker = toYahooTicker(ticker)

    // Convert period to Yahoo Finance range
    const rangeMap: Record<string, string> = {
      '1mo': '1mo',
      '2mo': '3mo',
      '6mo': '6mo',
      '1y': '1y',
    }
    const range = rangeMap[period] ?? '1mo'

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yticker)}?interval=1d&range=${range}`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 }
    })

    if (!res.ok) throw new Error(`Yahoo Finance history error ${res.status} for ${ticker}`)

    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) throw new Error(`No history data for ${ticker}`)

    const timestamps: number[] = result.timestamp ?? []
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? []

    const history: Record<string, number> = {}
    timestamps.forEach((ts, i) => {
      if (closes[i] != null) {
        const date = new Date(ts * 1000).toISOString().split('T')[0]
        history[date] = closes[i]
      }
    })

    return history
  } catch (error) {
    console.error(`Error fetching TradFi history for ${ticker}:`, error)
    return {}
  }
}
