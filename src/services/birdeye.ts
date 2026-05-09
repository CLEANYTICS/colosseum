import { XSTOCK_LIQUID, GOLD_ASSETS } from './solana'

const BIRDEYE_KEY = 'e08421b32b6d4507b72b89d57d18d6fe'

export async function fetchBirdeyePriceAtDate(
  mint: string,
  date: Date
): Promise<number | null> {
  const timeFrom = Math.floor(date.getTime() / 1000) - 86400
  const timeTo   = Math.floor(date.getTime() / 1000) + 86400

  const url = new URL('https://public-api.birdeye.so/defi/historical_price_unix')
  url.searchParams.set('address', mint)
  url.searchParams.set('address_type', 'token')
  url.searchParams.set('time_from', String(timeFrom))
  url.searchParams.set('time_to', String(timeTo))

  const response = await fetch(url.toString(), {
    headers: {
      'X-API-KEY': BIRDEYE_KEY,
      'x-chain': 'solana',
    },
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Birdeye error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const items = data?.data?.items ?? []
  if (!items.length) return null
  return items[Math.floor(items.length / 2)]?.value ?? null
}