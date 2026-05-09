// src/components/SolanaAdvantageCard.tsx

export default function SolanaAdvantageCard() {
  return (
    <div style={{
      backgroundColor: '#FFF1E5',
      padding: '32px 64px',
      fontFamily: 'Georgia, serif',
      borderBottom: '1px solid #ccc5b5',
    }}>

      {/* Label */}
      <div style={{
        fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase',
        color: '#9b8e80', marginBottom: '20px', fontFamily: 'Georgia, serif',
      }}>
        The Warsh Effect · January 30, 2026
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>

        {/* Left — story */}
        <div>
          <p style={{
            fontSize: '15px', color: '#1a1a1a', lineHeight: 2,
            margin: 0, fontFamily: 'Georgia, serif',
          }}>
            Friday afternoon. Trump nominates Kevin Warsh as Fed Chair.<br />
            TradFi closes for the weekend.<br />
            <span style={{ fontWeight: 600 }}>Solana kept trading.</span>
          </p>
        </div>

        {/* Right — numbers */}
        <div style={{ borderLeft: '1px solid #ccc5b5', paddingLeft: '64px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr', alignItems: 'baseline', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>Silver</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#c0392b', fontVariantNumeric: 'tabular-nums', fontFamily: 'Georgia, serif' }}>-37%</div>
              <div style={{ fontSize: '11px', color: '#9b8e80', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>worst day since March 1980</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr', alignItems: 'baseline', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>Gold</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#c0392b', fontVariantNumeric: 'tabular-nums', fontFamily: 'Georgia, serif' }}>-11%</div>
              <div style={{ fontSize: '11px', color: '#9b8e80', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>worst day since 2013</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
