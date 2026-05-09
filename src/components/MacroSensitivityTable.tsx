'use client'

import { useState } from 'react'
import { Sentiment } from '@/app/page'
import { MacroEvent } from '@/data/events'

interface MacroAsset {
  id: string
  label: string
  ticker: string
  sentiment: Sentiment
  sentimentReason: string
}

const ASSET_CONTEXT: Record<string, { watchNote: string }> = {
  gold: { watchNote: 'Gold is a real yield proxy — it falls when rates rise and inflation expectations drop. Under a hawkish Warsh path, rising real yields make holding gold less attractive. Watch for gold to weaken as June FOMC approaches and rate-cut hopes fade further.' },
  dxy: { watchNote: "The dollar strengthens when US rates rise relative to other countries. Warsh signaling a higher-for-longer path widens rate differentials in the dollar's favor. Today's dip is noise — watch DXY direction around any Warsh hawkish commentary." },
  us10y: { watchNote: 'The 10Y yield is the market\'s best guess at long-term Fed policy. A breakout above 4.5% would confirm the hawkish repricing is accelerating. Watch this level closely — it would pressure both equities and gold simultaneously.' },
  spy: { watchNote: "Equity valuations depend on discount rates. Higher rates mean future earnings are worth less today — compressing price-to-earnings multiples. Today's green is short-term noise. Watch for multiple compression as the June FOMC approaches." },
  qqq: { watchNote: 'Tech stocks are long-duration assets — their value is weighted toward future earnings, making them the most rate-sensitive part of the market. Nasdaq is up today but is the most exposed sector if Warsh follows through on a hawkish path.' },
  us2y: { watchNote: 'The 2Y yield is the purest market pricing of near-term Fed policy — it moves before the 10Y because it reflects what traders think the Fed will do in the next 1-2 years. A rising 2Y confirms conviction. Watch for the 2Y-10Y spread to steepen.' },
  vix: { watchNote: 'VIX measures expected volatility — a low VIX with rising yields is a fragile combination. Markets are calm now but any hawkish surprise from Warsh could spike VIX rapidly. Low VIX is an opportunity to hedge, not a signal of safety.' },
}

const ONCHAIN_ASSETS: Record<string, { mint: string; label: string; jupiterPair: string }> = {
  gold: { mint: 'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re', label: 'GLDX', jupiterPair: 'GLDX-USDC' },
  spy:  { mint: 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W',  label: 'SPYx', jupiterPair: 'SPYx-USDC' },
  qqq:  { mint: 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ',  label: 'QQQx', jupiterPair: 'QQQx-USDC' },
}

const JUPITER_REFERRAL = process.env.NEXT_PUBLIC_JUPITER_REFERRAL ?? ''

function OnboardingModal({ onClose, assetLabel, jupiterPair }: {
  onClose: () => void
  assetLabel: string
  jupiterPair: string
}) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'Get a Solana wallet',
      description: 'You\'ll need a Solana wallet to trade on-chain. We recommend Phantom or Backpack — both are free, take 2 minutes to set up, and work in your browser.',
      actions: [
        { label: '↗ Get Phantom', url: 'https://phantom.app' },
        { label: '↗ Get Backpack', url: 'https://backpack.app' },
      ],
      note: 'Already have a wallet? Skip to step 2.'
    },
    {
      title: 'Get USDC on Solana',
      description: `You'll need USDC to swap for ${assetLabel}. The easiest way is to buy directly with a card via MoonPay or transfer from Coinbase.`,
      actions: [
        { label: '↗ Buy via MoonPay', url: 'https://www.moonpay.com' },
        { label: '↗ Transfer from Coinbase', url: 'https://www.coinbase.com' },
      ],
      note: 'USDC on Solana settles in seconds for less than $0.01 in fees.'
    },
    {
      title: `Swap for ${assetLabel} on Jupiter`,
      description: `${assetLabel} is the on-chain equivalent of this TradFi asset — same exposure, no broker, no market hours. Jupiter is Solana's leading DEX aggregator.`,
      actions: [
        { label: `↗ Swap USDC to ${assetLabel} on Jupiter`, url: `https://jup.ag/swap/${jupiterPair}?referrer=${JUPITER_REFERRAL}&feeBps=50`, primary: true },
      ],
      note: 'Trades settle in under 1 second. Platform fee: 0.5% via CLEANYTICS.'
    },
  ]

  const current = steps[step]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ backgroundColor: '#FFF1E5', borderTop: '3px solid #1a1a1a', width: '100%', maxWidth: '480px', padding: '32px', fontFamily: 'Georgia, serif', position: 'relative' }}>

        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '11px', color: '#9b8e80', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
          ✕ close
        </button>

        <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0D6B52', marginBottom: '8px' }}>
          How to act on this signal · Solana
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
          Get started in 3 steps
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {steps.map((s, i) => (
            <div key={i} onClick={() => i < step + 1 && setStep(i)} style={{ flex: 1, height: '2px', backgroundColor: i <= step ? '#1a1a1a' : '#ccc5b5', cursor: i < step ? 'pointer' : 'default' }} />
          ))}
        </div>

        <div style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9b8e80', marginBottom: '8px' }}>
          Step {step + 1} of {steps.length}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
          {current.title}
        </div>
        <p style={{ fontSize: '13px', color: '#4a4035', lineHeight: 1.7, margin: '0 0 20px', fontFamily: 'Georgia, serif' }}>
          {current.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {current.actions.map((action, i) => (
            <a key={i} href={action.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', padding: '10px 16px',
              backgroundColor: (action as any).primary ? '#1a1a1a' : '#fff',
              color: (action as any).primary ? '#fff' : '#1a1a1a',
              border: '1px solid #1a1a1a',
              fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              fontFamily: 'Georgia, serif', textAlign: 'center',
            }}>
              {action.label}
            </a>
          ))}
        </div>

        <div style={{ fontSize: '10px', color: '#9b8e80', fontStyle: 'italic', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
          {current.note}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ background: 'none', border: '1px solid #ccc5b5', padding: '8px 16px', fontSize: '12px', color: step === 0 ? '#ccc5b5' : '#4a4035', cursor: step === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif' }}>
            ← Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ backgroundColor: '#1a1a1a', border: 'none', padding: '8px 16px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 600 }}>
              Next →
            </button>
          ) : (
            <button onClick={onClose} style={{ backgroundColor: '#0D6B52', border: 'none', padding: '8px 16px', fontSize: '12px', color: '#fff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 600 }}>
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MacroSensitivityTable({
  assets,
  tradfiMap,
  changePctMap,
  events = [],
}: {
  assets: MacroAsset[]
  tradfiMap: Record<string, number>
  changePctMap: Record<string, number>
  events?: MacroEvent[]
}) {
  const [selectedId, setSelectedId] = useState<string>(assets[0]?.id ?? '')
  const [showModal, setShowModal] = useState(false)

  const selected = assets.find(a => a.id === selectedId)
  const onchain = selected ? ONCHAIN_ASSETS[selected.id] : null

  const historicalSignals = selected
    ? events
        .filter(e => e.type !== 'future' && e.assetReactions.some(r => r.ticker === selected.ticker))
        .map(e => ({
          eventLabel: e.label,
          eventDate: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          reaction: e.assetReactions.find(r => r.ticker === selected.ticker)!,
        }))
    : []

  const ACCENT: Record<Sentiment, string> = {
    bullish: '#0D6B52',
    bearish: '#c0392b',
    watch:   '#b07d00',
    neutral: '#888',
  }

  return (
    <>
      {showModal && selected && onchain && (
        <OnboardingModal onClose={() => setShowModal(false)} assetLabel={onchain.label} jupiterPair={onchain.jupiterPair} />
      )}

      <div style={{ marginBottom: '0' }}>

        {/* Section header */}
        <div style={{
          borderTop: '2px solid #1a1a1a',
          paddingTop: '12px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a', fontFamily: 'Georgia, serif', fontWeight: 600 }}>
            Macro Sensitivity
          </span>
          <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            TradFi · click any asset to see thesis
          </span>
        </div>

        {/* Split panel — no box, just a vertical hairline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>

          {/* Left — asset list */}
          <div style={{ borderRight: '1px solid #e8e2d6' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px',
              paddingBottom: '8px', paddingRight: '32px',
              fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#9b8e80', borderBottom: '1px solid #ccc5b5',
              fontFamily: 'Georgia, serif',
            }}>
              <span>Asset</span>
              <span style={{ textAlign: 'right' }}>Price · Today</span>
            </div>

            {assets.map((asset, idx) => {
              const price = tradfiMap[asset.ticker]
              const changePct = changePctMap[asset.ticker]
              const isPositive = changePct >= 0
              const isSelected = selectedId === asset.id
              const hasOnchain = !!ONCHAIN_ASSETS[asset.id]
              const accent = ACCENT[asset.sentiment]

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedId(asset.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 120px',
                    padding: '12px 0', paddingRight: '32px',
                    borderBottom: idx < assets.length - 1 ? '1px solid #e8e2d6' : 'none',
                    borderLeft: `2px solid ${isSelected ? accent : 'transparent'}`,
                    paddingLeft: isSelected ? '10px' : '0',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Georgia, serif', color: isSelected ? accent : '#1a1a1a' }}>
                      {asset.label}
                    </div>
                    {hasOnchain && (
                      <span style={{
                        fontSize: '8px', padding: '1px 5px',
                        border: '1px solid #0D6B52',
                        color: '#0D6B52',
                        fontFamily: 'Georgia, serif',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                      }}>
                        ON-CHAIN
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
                      {price ? price.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                    </div>
                    {changePct !== undefined && (
                      <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 500, color: isPositive ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif' }}>
                        {isPositive ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right — thesis panel */}
          <div style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
            {selected ? (
              <>
                <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '10px', paddingTop: '8px' }}>
                  What to watch · {selected.label}
                </div>

                <p style={{ fontSize: '13px', color: '#4a4035', fontFamily: 'Georgia, serif', lineHeight: 1.7, margin: '0 0 20px' }}>
                  {ASSET_CONTEXT[selected.id]?.watchNote ?? selected.sentimentReason}
                </p>

                {historicalSignals.length > 0 && (
                  <>
                    <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9b8e80', fontFamily: 'Georgia, serif', marginBottom: '10px', paddingTop: '16px', borderTop: '1px solid #e8e2d6' }}>
                      Warsh era signal · how it already reacted
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                      {historicalSignals.map((sig, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid #e8e2d6',
                        }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>{sig.eventLabel}</div>
                            <div style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>{sig.eventDate}</div>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Georgia, serif', color: sig.reaction.changePct >= 0 ? '#0D6B52' : '#c0392b', fontVariantNumeric: 'tabular-nums' }}>
                            {sig.reaction.changePct >= 0 ? '+' : ''}{sig.reaction.changePct}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {onchain && (
                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e8e2d6' }}>
                    <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0D6B52', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>
                      Act on this signal · Solana
                    </div>
                    <p style={{ fontSize: '12px', color: '#4a4035', fontFamily: 'Georgia, serif', lineHeight: 1.6, margin: '0 0 12px' }}>
                      <strong>{onchain.label}</strong> is the same asset trading on Solana — 24/7, no broker, instant settlement.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setShowModal(true)}
                        style={{ flex: 1, padding: '9px 12px', backgroundColor: 'transparent', border: '1px solid #1a1a1a', fontSize: '11px', fontWeight: 600, color: '#1a1a1a', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
                      >
                        New to Solana? →
                      </button>
                      <a
                        href={`https://jup.ag/swap/${onchain.jupiterPair}?referrer=${JUPITER_REFERRAL}&feeBps=50`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, padding: '9px 12px', backgroundColor: '#1a1a1a', border: 'none', fontSize: '11px', fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'Georgia, serif', textDecoration: 'none', textAlign: 'center' }}
                      >
                        Swap {onchain.label} →
                      </a>
                    </div>
                    <div style={{ fontSize: '9px', color: '#9b8e80', fontFamily: 'Georgia, serif', marginTop: '6px', fontStyle: 'italic' }}>
                      Powered by Jupiter · 0.5% platform fee
                    </div>
                  </div>
                )}

                {!onchain && (
                  <div style={{ fontSize: '11px', color: '#9b8e80', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e8e2d6' }}>
                    No on-chain equivalent available for this asset yet.
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: '12px', color: '#9b8e80', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                Select an asset to see thesis context
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
