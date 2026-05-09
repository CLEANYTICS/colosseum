// src/services/pacifica.ts

const PACIFICA_API = 'https://api.pacifica.fi/api/v1'

export interface PacificaMarket {
  symbol: string
  mark: number
  oracle: number
  volume24h: number
  openInterest: number
  fundingRate: number
  changePct: number
}

const MACRO_SYMBOLS = ['XAU', 'XAG', 'CL', 'EURUSD', 'USDJPY']

export async function fetchPacificaPerps(): Promise<PacificaMarket[]> {
  try {
    const res = await fetch(`${PACIFICA_API}/info/prices`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) throw new Error(`Pacifica API error ${res.status}`)

    const data = await res.json()
    const markets: any[] = data?.data ?? []

    return markets
      .filter(m => MACRO_SYMBOLS.includes(m.symbol))
      .map(m => {
        const mark = parseFloat(m.mark)
        const yesterday = parseFloat(m.yesterday_price)
        const changePct = yesterday ? ((mark - yesterday) / yesterday) * 100 : 0

        return {
          symbol: m.symbol,
          mark,
          oracle: parseFloat(m.oracle),
          volume24h: parseFloat(m.volume_24h),
          openInterest: parseFloat(m.open_interest),
          fundingRate: parseFloat(m.funding),
          changePct,
        }
      })
      .sort((a, b) => MACRO_SYMBOLS.indexOf(a.symbol) - MACRO_SYMBOLS.indexOf(b.symbol))

  } catch (error) {
    console.error('Pacifica fetch error:', error)
    return []
  }
}