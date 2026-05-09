export type AssetType = 'tradfi' | 'solana' | 'prediction_market'

export type Source = 'yfinance' | 'helius' | 'jupiter' | 'polymarket'

export interface MarketDataPoint {
  timestamp: string
  useCaseId: string
  assetId: string
  assetType: AssetType
  value: number
  volume?: number
  source: Source
}

export interface DivergencePair {
  id: string
  useCaseId: string
  label: string
  tradfiValue: number
  onchainValue: number
  divergencePct: number
  zScore?: number
  volumeWeight?: number
}

export interface AssetConfig {
  id: string
  label: string
  assetType: AssetType
  source: Source
  ticker?: string
  mintAddress?: string
  context: {
    whyHere: string
    discountMeaning: string
    premiumMeaning: string
    noiseThreshold: number
  }
}

export interface UseCaseConfig {
  id: string
  title: string
  date: string
  status: 'live' | 'historical' | 'upcoming'
  predictionMarkets: AssetConfig[]
  tradfi: AssetConfig[]
  solana: AssetConfig[]
}