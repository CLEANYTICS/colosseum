// src/test-solana.ts
import { config } from 'dotenv'
config({ path: '.env.local' })  // ← add this line FIRST

import { fetchSolanaPrices, SOLANA_ASSETS } from './services/solana'

async function test() {
  console.log('API Key loaded:', !!process.env.JUPITER_API_KEY)
  console.log('Testing Jupiter fetcher...')
  const prices = await fetchSolanaPrices()
  
  for (const [label, mintAddress] of Object.entries(SOLANA_ASSETS)) {
    console.log(`${label}: $${prices[mintAddress] ?? 'unavailable'}`)
  }
}

test()