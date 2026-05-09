import { formatLiquidity, SolanaAssetData } from '@/services/solana'

interface BridgeAsset {
  id: string
  label: string
  solanaMint: string
  solanaLabel: string
  context: string
  liquidityNote: string
}

export default function InstitutionalBridgeTable({
  assets,
  solanaPrices,
}: {
  assets: BridgeAsset[]
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
          Institutional Bridge
        </span>
        <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
          On-chain institutional flow · directional signal only
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '180px 140px 100px 1fr',
        gap: '16px', paddingBottom: '8px',
        fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#9b8e80', borderBottom: '1px solid #ccc5b5',
        fontFamily: 'Georgia, serif',
      }}>
        <span>Asset</span>
        <span>On-Chain Price</span>
        <span>24h</span>
        <span>Context</span>
      </div>

      {assets.map((asset, idx) => {
        const solanaData = solanaPrices[asset.solanaMint]
        return (
          <div key={asset.id} style={{
            display: 'grid', gridTemplateColumns: '180px 140px 100px 1fr',
            gap: '16px', padding: '16px 0',
            borderBottom: idx < assets.length - 1 ? '1px solid #e8e2d6' : 'none',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
                {asset.label}
              </div>
              <div style={{ fontSize: '9px', color: '#9b8e80', marginTop: '3px', fontFamily: 'Georgia, serif' }}>
                {asset.liquidityNote}
              </div>
            </div>

            <div>
              {solanaData ? (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#1a1a1a', fontFamily: 'Georgia, serif' }}>
                    {solanaData.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                    {asset.solanaLabel}{formatLiquidity(solanaData.liquidity) ? ` · ${formatLiquidity(solanaData.liquidity)} liq` : ''}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '12px', color: '#ccc' }}>—</div>
              )}
            </div>

            <div>
              {solanaData?.priceChange24h != null ? (
                <div style={{
                  fontSize: '11px', fontWeight: 500,
                  color: solanaData.priceChange24h >= 0 ? '#0D6B52' : '#c0392b',
                  fontFamily: 'Georgia, serif',
                }}>
                  {solanaData.priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(solanaData.priceChange24h).toFixed(2)}%
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#ddd' }}>—</div>
              )}
            </div>

            <div style={{ fontSize: '11px', color: '#6b6055', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>
              {asset.context}
            </div>
          </div>
        )
      })}
    </div>
  )
}
