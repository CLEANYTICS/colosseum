// src/services/polymarket.ts

const GAMMA_BASE = 'https://gamma-api.polymarket.com';

interface PolymarketMarket {
  conditionId: string;
  outcomePrices: string;
  question: string;
  groupItemTitle: string;
  active: boolean;
  closed: boolean;
  volume: string;
  liquidity: string;
}

interface PolymarketEvent {
  id: string;
  title: string;
  slug: string;
  markets: PolymarketMarket[];
}

/**
 * Fetches the probability of a specific outcome from Polymarket
 * Returns a number between 0 and 1
 */
export async function fetchMarketProbability(conditionId: string): Promise<number> {
  if (!conditionId || conditionId === 'FIND_ON_POLYMARKET') {
    console.warn(`No valid conditionId provided.`);
    return 0;
  }

  try {
    const response = await fetch(
      `${GAMMA_BASE}/markets?conditionId=${conditionId}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const market: PolymarketMarket = data[0];

    if (!market || !market.outcomePrices) {
      console.error(`Market not found for conditionId: ${conditionId}`);
      return 0;
    }

    // outcomePrices comes back as a stringified array: "[\"0.0405\", \"0.9595\"]"
    // Index 0 is always the "Yes" probability
    const prices = JSON.parse(market.outcomePrices);
    return parseFloat(prices[0]);

  } catch (error) {
    console.error(`Error fetching Polymarket data for ${conditionId}:`, error);
    return 0;
  }
}

/**
 * Fetches all market probabilities for a given event slug in one request
 * Returns a map of conditionId -> probability
 * Use this instead of calling fetchMarketProbability multiple times
 */
export async function fetchEventProbabilities(
  eventSlug: string
): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      `${GAMMA_BASE}/events?slug=${eventSlug}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const event: PolymarketEvent = data[0];

    if (!event?.markets) {
      console.error(`No markets found for event: ${eventSlug}`);
      return {};
    }

    return event.markets.reduce((acc: Record<string, number>, market: PolymarketMarket) => {
      if (market.conditionId && market.outcomePrices) {
        const prices = JSON.parse(market.outcomePrices);
        acc[market.conditionId] = parseFloat(prices[0]);
      }
      return acc;
    }, {});

  } catch (error) {
    console.error(`Error fetching event probabilities for ${eventSlug}:`, error);
    return {};
  }
}

/**
 * Fetches full market details for a given event slug
 * Returns the raw markets array with all metadata
 * Useful when you need volume, liquidity, or question text alongside probabilities
 */
export async function fetchEventMarkets(
  eventSlug: string
): Promise<PolymarketMarket[]> {
  try {
    const response = await fetch(
      `${GAMMA_BASE}/events?slug=${eventSlug}`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const event: PolymarketEvent = data[0];

    if (!event?.markets) {
      console.error(`No markets found for event: ${eventSlug}`);
      return [];
    }

    return event.markets;

  } catch (error) {
    console.error(`Error fetching event markets for ${eventSlug}:`, error);
    return [];
  }
}
// Add to src/services/polymarket.ts

export async function fetchPolymarketNoChangeHistory(): Promise<{ t: number; p: number }[]> {
  try {
    const TOKEN_ID = '30767812841387255642892182147223249245545002662653079696958384408588201824258'
    const url = new URL('https://clob.polymarket.com/prices-history')
    url.searchParams.set('market', TOKEN_ID)
    url.searchParams.set('interval', 'max')
    url.searchParams.set('fidelity', '1440')

    const response = await fetch(url.toString(), { next: { revalidate: 300 } })
    if (!response.ok) throw new Error(`Polymarket history error ${response.status}`)

    const data = await response.json()
    return (data?.history ?? []).filter((d: any) => d.p > 0 && d.p <= 1)
  } catch (error) {
    console.error('Polymarket history error:', error)
    return []
  }
}