// src/components/Masthead.tsx

export default function Masthead() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      <header style={{
        backgroundColor: '#FFF1E5',
        fontFamily: 'Georgia, "Times New Roman", serif',
        borderBottom: '2px solid #1a1a1a',
        padding: '20px 64px 16px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        {/* Left — name + tagline */}
        <div>
          <h1 style={{
            fontSize: '38px', fontWeight: '700',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            margin: '0 0 3px', color: '#1a1a1a', lineHeight: 1,
            fontFamily: '"Cormorant Garamond", Georgia, serif',
          }}>
            CLEANYTICS
          </h1>
          <p style={{
            fontSize: '12px', color: '#6b6055', margin: 0,
            fontStyle: 'italic',
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            letterSpacing: '0.02em',
          }}>
            where markets meet context
          </p>
        </div>

        {/* Right — date only */}
        <div style={{
          fontSize: '11px', color: '#6b6055',
          fontFamily: 'Georgia, serif', letterSpacing: '0.02em',
        }}>
          {today}
        </div>
      </header>
    </>
  )
}
