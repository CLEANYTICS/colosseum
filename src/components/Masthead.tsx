// src/components/Masthead.tsx

interface MastheadProps {
  useCaseTitle: string
}

export default function Masthead({ useCaseTitle }: MastheadProps) {
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
      }}>

        {/* Main masthead row */}
        <div style={{
          padding: '20px 64px 16px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          borderBottom: '1px solid #ccc5b5',
        }}>
          {/* Left — name + tagline */}
          <div>
            <h1 style={{
              fontSize: '38px',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '0 0 3px',
              color: '#1a1a1a',
              lineHeight: 1,
              fontFamily: '"Cormorant Garamond", Georgia, serif',
            }}>
              CLEANYTICS
            </h1>
            <p style={{
              fontSize: '12px',
              color: '#6b6055',
              margin: 0,
              fontStyle: 'italic',
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              letterSpacing: '0.02em',
            }}>
              where markets meet context
            </p>
          </div>

          {/* Right — date + brief label */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '11px',
              color: '#1a1a1a',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.04em',
              marginBottom: '3px',
            }}>
              Morning Brief
            </div>
            <div style={{
              fontSize: '11px',
              color: '#6b6055',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.02em',
            }}>
              {today}
            </div>
          </div>
        </div>

        {/* Second row — description + data sources + use case */}
        <div style={{
          padding: '10px 64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
        }}>
          {/* Left — what is this */}
          <p style={{
            fontSize: '11px',
            color: '#4a4035',
            margin: 0,
            lineHeight: 1.6,
            fontFamily: 'Georgia, serif',
            flex: 1,
            maxWidth: '380px',
          }}>
            CLEANYTICS tracks macro events across traditional markets, prediction markets and Solana, connecting the signal to on-chain action.
          </p>

          {/* Right group — TradFi strip + use case, both right-aligned */}
          <div style={{
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#9b8e80',
              fontFamily: 'Georgia, serif',
              display: 'block',
            }}>
              TradFi · Prediction Markets · Solana
            </span>
            <span style={{
              fontSize: '11px',
              color: '#0D6B52',
              fontFamily: 'Georgia, serif',
              fontWeight: 600,
              letterSpacing: '0.02em',
              display: 'block',
            }}>
              {useCaseTitle}
            </span>
          </div>
        </div>

      </header>
    </>
  )
}
