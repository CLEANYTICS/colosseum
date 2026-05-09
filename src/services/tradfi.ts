// src/services/tradfi.ts

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API ?? 'http://localhost:8000'

export interface TradFiPrice {
  ticker: string
  price: number
  change_pct: number
  previous_close: number
}

export async function fetchTradFiPrice(ticker: string): Promise<TradFiPrice | null> {
  try {
    const res = await fetch(`${PYTHON_API}/tradfi/${ticker}`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) throw new Error(`Failed to fetch ${ticker}`)
    return res.json()
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
    const res = await fetch(`${PYTHON_API}/tradfi/${ticker}/history?period=${period}`, {
      next: { revalidate: 300 }
    })
    if (!res.ok) throw new Error(`Failed to fetch history for ${ticker}`)
    return res.json()
  } catch (error) {
    console.error(`Error fetching TradFi history for ${ticker}:`, error)
    return {}
  }
}