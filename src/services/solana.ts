// src/services/solana.ts

const JUPITER_PRICE_API = 'https://api.jup.ag/price/v3'

// ── Tokenized gold & ETFs (existing) ──────────────────────────────
export const GOLD_ASSETS = {
  GLDX: 'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re',  // GLD ETF tokenized
  XAUm: '5aLhp9VnUEKcsdtkfsf2DUgpJfomx7GmYVny24dHUZoB',  // Spot gold tokenized
}

// ── xStocks — liquid equity indices (divergence table) ────────────
export const XSTOCK_LIQUID = {
  SPYX: 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W',  // S&P 500 ~$2.7M liq
  QQQX: 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ',  // Nasdaq 100 ~$2.0M liq
}

// ── Institutional bridge ───────────────────────────────────────────
export const INSTITUTIONAL_ASSETS = {
  BUIDL: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E', // BlackRock BUIDL
  GLDX:  'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re', // GLD tokenized
}

// ── All mints flat (for batch Jupiter fetch) ───────────────────────
export const SOLANA_ASSETS = {
  ...GOLD_ASSETS,
  ...XSTOCK_LIQUID,
  BUIDL: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
  SOL: 'So11111111111111111111111111111111111111112',
}

export interface SolanaAssetData {
  price: number
  liquidity: number | null
  priceChange24h: number | null
}

export async function fetchSolanaPrices(): Promise<Record<string, SolanaAssetData>> {
  try {
    const ids = [...new Set(Object.values(SOLANA_ASSETS))].join(',')

    const response = await fetch(
      `${JUPITER_PRICE_API}?ids=${ids}`,
      {
        headers: { 'x-api-key': process.env.JUPITER_API_KEY ?? '' },
        next: { revalidate: 60 }
      }
    )

    if (!response.ok) throw new Error(`Jupiter API error: ${response.status}`)

    const data = await response.json()

    const result: Record<string, SolanaAssetData> = {}
    for (const [mintAddress, info] of Object.entries(data)) {
      result[mintAddress] = {
        price: (info as any).usdPrice ?? 0,
        liquidity: (info as any).liquidity ?? null,
        priceChange24h: (info as any).priceChange24h ?? null
      }
    }
    return result

  } catch (error) {
    console.error('Error fetching Solana prices:', error)
    return {}
  }
}

export function computeDivergence(tradfiPrice: number, solanaPrice: number): number {
  return ((solanaPrice - tradfiPrice) / tradfiPrice) * 100
}

export function getDivergenceScore(
  divergencePct: number,
  noiseThreshold: number,
  liquidity: number | null
): { label: string; color: string } {
  const abs = Math.abs(divergencePct)

  // First bucket by liquidity
  if (!liquidity || liquidity < 50_000) {
    return { label: 'Speculative', color: '#9945FF' }
  }
  if (liquidity < 500_000) {
    return { label: 'Emerging', color: '#b07d00' }
  }

  // High liquidity — now score by divergence magnitude
  if (abs < noiseThreshold) return { label: 'Noise', color: '#999' }
  if (abs < noiseThreshold * 2) return { label: 'Institutional', color: '#0F6E56' }
  if (abs < noiseThreshold * 4) return { label: 'Strong Signal', color: '#c0392b' }
  return { label: 'Conviction', color: '#8b0000' }
}

export function formatLiquidity(liquidity: number | null): string | null {
  if (!liquidity) return null
  if (liquidity >= 1_000_000) return `$${(liquidity / 1_000_000).toFixed(1)}M`
  if (liquidity >= 1_000) return `$${(liquidity / 1_000).toFixed(0)}K`
  return `$${liquidity.toFixed(0)}`
}