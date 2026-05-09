export type EventType = 'bearish_shock' | 'policy_milestone' | 'nomination' | 'future'

export interface AssetReaction {
  ticker: string
  label: string
  changePct: number
}

export interface MacroEvent {
  id: string
  date: string           // ISO date string
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
  title: 'The Warsh Era — Fed Chair Transition',
  subtitle: 'Powell term ends May 15th · Warsh confirmation imminent · June 16–17 FOMC is Warsh\'s first meeting · Oil above $100 keeping inflation elevated',
  description: 'Kevin Warsh replacing Powell as Fed Chair. First FOMC meeting June 16-17. Warsh seen as hawkish and dollar-friendly. Oil above $100 keeping inflation elevated.',
  events: [
    {
      id: 'warsh-leak',
      date: '2026-01-30',
      label: 'Gold & Silver drop',
      description: 'Warsh name leaked as frontrunner',
      type: 'bearish_shock',
      assetReactions: [
        { ticker: 'GC=F',    label: 'Gold',   changePct: -11.4 },
        { ticker: 'SI=F',    label: 'Silver',  changePct: -37.0 },
        { ticker: 'DX-Y.NYB',label: 'DXY',    changePct:  0.8 },
      ]
    },
    {
      id: 'senate-hearing',
      date: '2026-02-04',
      label: 'Senate hearing',
      description: 'Banking Committee begins confirmation process',
      type: 'nomination',
      assetReactions: [
        { ticker: 'GC=F',    label: 'Gold',   changePct: -2.1 },
        { ticker: 'DX-Y.NYB',label: 'DXY',    changePct:  0.8 },
        { ticker: '^TNX',    label: '10Y',    changePct:  0.12 },
      ]
    },
    {
      id: 'oil-100',
      date: '2026-03-18',
      label: 'Oil crosses $100',
      description: 'WTI >$100/bbl, rate cut odds collapse',
      type: 'bearish_shock',
      assetReactions: [
        { ticker: 'CL=F',    label: 'WTI Oil', changePct:  3.1 },
        { ticker: '^TNX',    label: '10Y',     changePct:  0.08 },
      ]
    },
    {
      id: 'warsh-confirmed',
      date: '2026-04-22',
      label: 'Senate confirmation',
      description: 'Warsh confirmed as Fed Chair',
      type: 'policy_milestone',
      assetReactions: [
        { ticker: 'GC=F',    label: 'Gold',   changePct: -1.4 },
        { ticker: 'DX-Y.NYB',label: 'DXY',    changePct:  0.4 },
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

// Add future use cases here — same shape, just swap the events array
export const ALL_USE_CASES: UseCase[] = [WARSH_ERA]