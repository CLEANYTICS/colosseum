// src/test-polymarket.ts
import { fetchEventProbabilities } from './services/polymarket'

async function test() {
  console.log('Testing Polymarket fetcher...')
  
  const probs = await fetchEventProbabilities('fed-decision-in-june-825')
  
  console.log('All probabilities:', probs)
  console.log('No change probability:', probs['0xde04b189b3f19eaccda02529a3ea67abfc46bff5c0c8fc42d8a2d0ed7b8f0d41'])
}

test()