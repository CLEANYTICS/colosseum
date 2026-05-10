// src/components/SolanaAdvantageCard.tsx

export default function SolanaAdvantageCard() {
  return (
    <div style={{
      backgroundColor: '#FFF1E5',
      padding: '32px 64px',
      fontFamily: 'Georgia, serif',
      borderBottom: '1px solid #ccc5b5',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>

        {/* Left */}
        <div>
          <div style={{
            fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#9b8e80', marginBottom: '8px', fontFamily: 'Georgia, serif',
          }}>
            January 30, 2026
          </div>
          <h2 style={{
            fontSize: '28px', fontWeight: 700, color: '#1a1a1a',
            margin: '0 0 20px', lineHeight: 1.2, fontFamily: 'Georgia, serif',
          }}>
            The Warsh Effect
          </h2>
          <p style={{ fontSize: '13px', color: '#4a4035', lineHeight: 1.9, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
            Friday afternoon. Trump nominates Kevin Warsh as Fed Chair.
          </p>
          <p style={{ fontSize: '13px', color: '#4a4035', lineHeight: 1.9, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
            TradFi closes for the weekend.
          </p>
          <p style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 700, lineHeight: 1.9, margin: 0, fontFamily: 'Georgia, serif' }}>
            Solana kept trading.
          </p>
        </div>

        {/* Right */}
        <div style={{ borderLeft: '1px solid #ccc5b5', paddingLeft: '64px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9b8e80', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
            Market reaction · January 30, 2026
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderTop: '2px solid #c0392b', paddingTop: '10px' }}>
              <div style={{ fontSize: '12px', color: '#9b8e80', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>Silver</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#c0392b', fontVariantNumeric: 'tabular-nums', lineHeight: 1, fontFamily: 'Georgia, serif' }}>-37%</div>
              <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '4px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Worst day since March 1980</div>
            </div>
            <div style={{ borderTop: '2px solid #c0392b', paddingTop: '10px' }}>
              <div style={{ fontSize: '12px', color: '#9b8e80', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>Gold</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#c0392b', fontVariantNumeric: 'tabular-nums', lineHeight: 1, fontFamily: 'Georgia, serif' }}>-11%</div>
              <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '4px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Worst day since 2013</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
