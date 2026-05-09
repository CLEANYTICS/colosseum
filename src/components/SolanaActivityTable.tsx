import { TokenActivity } from '@/services/helius'
import { SolanaAssetData, formatLiquidity } from '@/services/solana'

interface ActivityAsset {
  label: string
  mint: string
  solanaLabel: string
  macroContext: string
}

export default function SolanaActivityTable({
  assets,
  activity,
  solanaPrices,
}: {
  assets: ActivityAsset[]
  activity: Record<string, TokenActivity>
  solanaPrices: Record<string, SolanaAssetData>
}) {
  return (
    <div style={{ marginBottom: '40px' }}>

      {/* Section header */}
      <div style={{
        borderTop: '2px solid #1a1a1a',
        paddingTop: '12px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}>
        <span style={{
          fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#1a1a1a', fontFamily: 'Georgia, serif', fontWeight: 600,
        }}>
          Solana xStocks Pulse
        </span>
        <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
          On-chain activity · 24h · via Helius
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '160px 130px 110px 110px 1fr',
        gap: '16px', paddingBottom: '8px',
        fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#9b8e80', borderBottom: '1px solid #ccc5b5',
        fontFamily: 'Georgia, serif',
      }}>
        <span>Asset</span>
        <span>On-Chain Price</span>
        <span>Transfers 24h</span>
        <span>Wallets 24h</span>
        <span>Macro context</span>
      </div>

      {assets.map((asset, idx) => {
        const data = activity[asset.mint]
        const solanaData = solanaPrices[asset.mint]

        return (
          <div key={asset.mint} style={{
            display: 'grid', gridTemplateColumns: '160px 130px 110px 110px 1fr',
            gap: '16px', padding: '16px 0',
            borderBottom: idx < assets.length - 1 ? '1px solid #e8e2d6' : 'none',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
                {asset.label}
              </div>
              <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                {asset.solanaLabel}
              </div>
            </div>

            <div>
              {solanaData ? (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                    {solanaData.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                    {formatLiquidity(solanaData.liquidity) ? `${formatLiquidity(solanaData.liquidity)} liq` : ''}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '12px', color: '#ccc' }}>—</div>
              )}
            </div>

            <div>
              {data ? (
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' }}>
                  {data.transferCount24h.toLocaleString()}
                  <div style={{ fontSize: '9px', color: '#9b8e80', fontWeight: 400, marginTop: '2px' }}>transfers</div>
                </div>
              ) : <div style={{ fontSize: '12px', color: '#ccc' }}>—</div>}
            </div>

            <div>
              {data ? (
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Georgia, serif', fontVariantNumeric: 'tabular-nums' }}>
                  {data.uniqueWallets24h.toLocaleString()}
                  <div style={{ fontSize: '9px', color: '#9b8e80', fontWeight: 400, marginTop: '2px' }}>unique wallets</div>
                </div>
              ) : <div style={{ fontSize: '12px', color: '#ccc' }}>—</div>}
            </div>

            <div style={{ fontSize: '11px', color: '#6b6055', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>
              {asset.macroContext}
            </div>
          </div>
        )
      })}
    </div>
  )
}
