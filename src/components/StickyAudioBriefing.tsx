'use client'

import { useState, useRef, useEffect } from 'react'

const ELEVENLABS_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_KEY ?? ''
const VOICE_ID = 'onwK4e9ZLuTAKqWW03F9'

export default function StickyAudioBriefing({ narrative }: { narrative: string }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const paragraphs = narrative.split('\n\n').filter(p => p.trim()).map(p => p.replace(/\*\*/g, '').trim())
  const firstSentence = paragraphs[0]?.split('.')[0] + '.' ?? ''
  const previewText = firstSentence.length > 100 ? firstSentence.substring(0, 100) + '...' : firstSentence

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: narrative,
            model_id: 'eleven_flash_v2_5',
            voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.3 }
          })
        }
      )
      if (!response.ok) throw new Error(`ElevenLabs error ${response.status}`)
      const blob = await response.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError('Audio generation failed.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.onended = () => setIsPlaying(false)
    const update = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    audio.addEventListener('timeupdate', update)
    return () => audio.removeEventListener('timeupdate', update)
  }, [audioUrl])

  return (
    <div style={{
      position: 'fixed',
      top: '120px',
      right: 0,
      zIndex: 100,
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Tab trigger — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
          background: '#8B5E3C',
          color: '#fff',
          border: 'none',
          padding: '14px 8px',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          borderRadius: '4px 0 0 4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isPlaying ? '⏸' : '▶'} Morning Brief
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div style={{
          width: '240px',
          backgroundColor: '#fffef9',
          borderTopWidth: '3px',
          borderTopStyle: 'solid',
          borderTopColor: '#8B5E3C',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: '#e8e2d6',
          borderLeftWidth: '1px',
          borderLeftStyle: 'solid',
          borderLeftColor: '#e8e2d6',
          boxShadow: '-4px 4px 24px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '480px',
        }}>

          {/* Header */}
          <div style={{
            padding: '10px 14px',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderBottomColor: '#ede8de',
            backgroundColor: '#FFF1E5',
          }}>
            <div style={{
              fontSize: '14px', fontWeight: 600,
              color: '#1a1a1a',
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              letterSpacing: '0.01em',
            }}>
              Morning Brief
            </div>
            <div style={{
              fontSize: '10px', color: '#9b8e80',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic', marginTop: '2px',
            }}>
              {isPlaying ? 'Now playing...' : 'AI synthesis · ElevenLabs'}
            </div>
          </div>

          {/* Text preview */}
          <div style={{
            padding: '12px 14px',
            overflowY: 'auto',
            maxHeight: '220px',
          }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{
                fontSize: '11px',
                lineHeight: 1.8,
                color: '#4a3c30',
                margin: '0 0 10px',
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontStyle: 'italic',
              }}>
                {p}
              </p>
            ))}
          </div>

          {/* Audio controls */}
          <div style={{
            padding: '10px 14px',
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: '#ede8de',
            backgroundColor: '#FFF1E5',
            flexShrink: 0,
          }}>
            {audioUrl && <audio ref={audioRef} src={audioUrl} style={{ display: 'none' }} />}

            {!audioUrl ? (
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  backgroundColor: loading ? '#ede8de' : '#8B5E3C',
                  color: loading ? '#b0a090' : '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Georgia, serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: '8px', height: '8px',
                      borderRadius: '50%',
                      border: '1.5px solid #b0a090',
                      borderTopColor: 'transparent',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Generating...
                  </>
                ) : '▶ Listen to brief'}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={togglePlay}
                  style={{
                    width: '30px', height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#8B5E3C',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '11px', color: '#8B5E3C',
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    marginBottom: '4px', fontStyle: 'italic',
                  }}>
                    {isPlaying ? 'Playing...' : 'Ready to play'}
                  </div>
                  <div style={{ height: '2px', backgroundColor: '#ede8de', borderRadius: '1px' }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: '#8B5E3C',
                      borderRadius: '1px',
                      transition: 'width 0.5s linear',
                    }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ fontSize: '10px', color: '#c0392b', marginTop: '6px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  )
}