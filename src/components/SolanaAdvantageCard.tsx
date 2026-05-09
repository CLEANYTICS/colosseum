// src/components/SolanaAdvantageCard.tsx

export default function SolanaAdvantageCard() {
  return (
    <div style={{
      backgroundColor: '#FFF1E5',
      padding: '32px 64px',
      fontFamily: 'Georgia, serif',
      borderBottom: '2px solid #1a1a1a',
    }}>

      {/* Section label */}
      <div style={{
        fontSize: '10px',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: '#9b8e80',
        marginBottom: '20px',
      }}>
        The Solana Edge · A Real Example
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>

        {/* Left — the story */}
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: '0 0 16px',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>
            Friday, January 30th, 2026.
          </h2>

          <p style={{
            fontSize: '13px',
            color: '#4a4035',
            lineHeight: 1.9,
            margin: '0 0 20px',
          }}>
            Trump announced Kevin Warsh as Fed Chair nominee at midday.
            By 5pm ET, silver had fallen thirty-seven percent — its worst single day since March 1980.
            Gold fell eleven percent. TradFi markets closed for the weekend.
          </p>

          <p style={{
            fontSize: '13px',
            color: '#4a4035',
            lineHeight: 1.9,
            margin: '0 0 20px',
            fontStyle: 'italic',
          }}>
            On Solana, XAG silver perps on Pacifica never stopped trading.
            Through Friday night. Through the weekend. Instant settlement, no broker.
          </p>

          <a
            href="https://app.pacifica.fi/trade/SILVER"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '9px 18px',
              backgroundColor: 'transparent',
              color: '#1a1a1a',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: 'Georgia, serif',
              border: '1px solid #1a1a1a',
            }}
          >
            Trade XAG on Pacifica →
          </a>
        </div>

        {/* Right — the data */}
        <div style={{ borderLeft: '1px solid #ccc5b5', paddingLeft: '64px' }}>

          <div style={{
            fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase',
            color: '#9b8e80', marginBottom: '20px',
          }}>
            Market reaction · January 30, 2026
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            <div style={{ borderTop: '2px solid #c0392b', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9b8e80', marginBottom: '4px' }}>Silver · SI=F</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#c0392b', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                -37%
              </div>
              <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '4px', fontStyle: 'italic' }}>
                Worst day since March 1980 · Markets closed Friday 5pm
              </div>
            </div>

            <div style={{ borderTop: '2px solid #c0392b', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#9b8e80', marginBottom: '4px' }}>Gold · GC=F</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#c0392b', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                -11%
              </div>
              <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '4px', fontStyle: 'italic' }}>
                Worst day since 2013 · Markets closed Friday 5pm
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #ccc5b5', paddingTop: '16px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#0D6B52', marginBottom: '8px' }}>
              Solana · Trading 24/7
            </div>
            <div style={{ fontSize: '13px', color: '#4a4035', lineHeight: 1.7 }}>
              XAG perps on Pacifica · $882K daily volume · Instant settlement
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
