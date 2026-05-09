// src/services/helius.ts

const HELIUS_API = 'https://api.helius.xyz/v0'
const HELIUS_RPC = 'https://mainnet.helius-rpc.com'
const API_KEY = process.env.HELIUS_API_KEY ?? ''

export interface TokenActivity {
  mint: string
  label: string
  transferCount24h: number
  uniqueWallets24h: number
  volumeUsd24h: number | null
}

export async function fetchTokenActivity(
  mints: Record<string, string>  // { label: mintAddress }
): Promise<Record<string, TokenActivity>> {
  const result: Record<string, TokenActivity> = {}

  await Promise.all(
    Object.entries(mints).map(async ([label, mint]) => {
      try {
        // Helius enhanced transactions API — last 24h
        const res = await fetch(
          `${HELIUS_API}/addresses/${mint}/transactions?api-key=${API_KEY}&limit=100&type=TRANSFER`,
          { next: { revalidate: 300 } }
        )

        if (!res.ok) {
          console.error(`Helius error for ${label}: ${res.status}`)
          result[mint] = { mint, label, transferCount24h: 0, uniqueWallets24h: 0, volumeUsd24h: null }
          return
        }

        const txs: any[] = await res.json()

        // Filter to last 24h
        const cutoff = Date.now() / 1000 - 86400
        const recent = txs.filter(tx => tx.timestamp > cutoff)

        // Count unique wallets
        const wallets = new Set<string>()
        recent.forEach(tx => {
          if (tx.feePayer) wallets.add(tx.feePayer)
        })

        result[mint] = {
          mint,
          label,
          transferCount24h: recent.length,
          uniqueWallets24h: wallets.size,
          volumeUsd24h: null  // Helius doesn't give USD volume directly — we'll estimate later
        }

      } catch (err) {
        console.error(`Helius fetch error for ${label}:`, err)
        result[mint] = { mint, label, transferCount24h: 0, uniqueWallets24h: 0, volumeUsd24h: null }
      }
    })
  )

  return result
}