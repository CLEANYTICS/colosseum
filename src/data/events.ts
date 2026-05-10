export type EventType = 'bearish_shock' | 'policy_milestone' | 'nomination' | 'future'

export interface AssetReaction {
  ticker: string
  label: string
  changePct: number
}

export interface MacroEvent {
  id: string
  date: string
  label: string
  description: string
  type: EventType
  assetReactions: AssetReaction[]
  predictionMarketNote?: string
}

export interface UseCase {
  id: string
  title: string
  subtitle: string
  description: string
  events: MacroEvent[]
}

export const WARSH_ERA: UseCase = {
  id: 'warsh-era',
  title: 'The Warsh Effect',
  subtitle: 'Powell term ends May 15th · Warsh chairs June 16-17 FOMC · Hormuz crisis pushed oil above $100 · now retreating',
  description: 'Kevin Warsh replacing Powell as Fed Chair. First FOMC meeting June 16-17. Warsh seen as hawkish and dollar-friendly. Hormuz crisis pushed oil above $100 but prices now retreating toward $95 as ceasefire talks progress.',
  events: [
    {
      id: 'warsh-leak',
      date: '2026-01-30',
      label: 'Gold & Silver drop',
      description: 'Warsh nominated as Fed Chair',
      type: 'bearish_shock',
      assetReactions: [
        { ticker: 'GC=F',     label: 'Gold',            changePct: -11.4 },
        { ticker: 'SI=F',     label: 'Silver Futures',  changePct: -31.4 },
        { ticker: 'DX-Y.NYB', label: 'DXY',             changePct:  0.8  },
      ]
    },
    {
      id: 'senate-hearing',
      date: '2026-02-04',
      label: 'Senate hearing',
      description: 'Banking Committee begins confirmation process',
      type: 'nomination',
      assetReactions: [
        { ticker: 'GC=F',     label: 'Gold', changePct: -2.1  },
        { ticker: 'DX-Y.NYB', label: 'DXY',  changePct:  0.8  },
        { ticker: '^TNX',     label: '10Y',  changePct:  0.12 },
      ]
    },
    {
      id: 'oil-100',
      date: '2026-03-18',
      label: 'Hormuz crisis',
      description: 'Strait of Hormuz closed, oil spikes above $100, rate cut odds collapse',
      type: 'bearish_shock',
      assetReactions: [
        { ticker: 'CL=F', label: 'WTI Oil (peak)',    changePct:  38.0 },
        { ticker: '^TNX', label: '10Y Yield',          changePct:  0.4  },
        { ticker: 'SPY',  label: 'S&P 500',            changePct: -4.2  },
      ]
    },
    {
      id: 'warsh-confirmed',
      date: '2026-04-22',
      label: 'Senate confirmation',
      description: 'Warsh confirmed as Fed Chair',
      type: 'policy_milestone',
      assetReactions: [
        { ticker: 'GC=F',     label: 'Gold', changePct: -1.4 },
        { ticker: 'DX-Y.NYB', label: 'DXY',  changePct:  0.4 },
      ]
    },
    {
      id: 'oil-retreat',
      date: '2026-05-06',
      label: 'Oil retreats',
      description: 'WTI drops 12% on ceasefire talks, Hormuz reopening hopes',
      type: 'policy_milestone',
      assetReactions: [
        { ticker: 'CL=F', label: 'WTI Oil', changePct: -12.0 },
        { ticker: 'SPY',  label: 'S&P 500', changePct:   2.1  },
      ]
    },
    {
      id: 'powell-exit',
      date: '2026-05-15',
      label: 'Powell term ends',
      description: 'Warsh takes the chair — symbolic transition, markets already priced',
      type: 'policy_milestone',
      assetReactions: []
    },
    {
      id: 'first-fomc',
      date: '2026-06-16',
      label: 'First FOMC',
      description: "Warsh's first rate decision as Chair",
      type: 'future',
      assetReactions: [],
      predictionMarketNote: 'No change 95.5%'
    },
  ]
}

export const ALL_USE_CASES: UseCase[] = [WARSH_ERA]
