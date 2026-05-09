// src/lib/enrichEvents.ts

import { MacroEvent } from '@/data/events'

export async function enrichEventReactions(
  events: MacroEvent[],
  history: Record<string, Record<string, number>>
): Promise<MacroEvent[]> {
  return events.map(event => ({
    ...event,
    assetReactions: event.assetReactions.map(reaction => {
      const prices = history[reaction.ticker]
      if (!prices) return reaction

      const dates = Object.keys(prices).sort()
      const idx = dates.findIndex(d => d.startsWith(event.date))
      if (idx < 1) return reaction

      const price = prices[dates[idx]]
      const prevPrice = prices[dates[idx - 1]]
      if (!price || !prevPrice) return reaction

      return {
        ...reaction,
        changePct: parseFloat((((price - prevPrice) / prevPrice) * 100).toFixed(2))
      }
    })
  }))
}