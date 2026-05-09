import { computeDivergence, getDivergenceScore, formatLiquidity, SolanaAssetData } from '@/services/solana'

interface DivergenceAsset {
  id: string
  label: string
  ticker: string
  solanaMint: string
  solanaLabel: string
  noiseThreshold: number
}

export default function DivergenceTable({
  assets,
  tradfiMap,
  changePctMap,
  solanaPrices,
}: {
  assets: DivergenceAsset[]
  tradfiMap: Record<string, number>
  changePctMap: Record<string, number>
  solanaPrices: Record<string, SolanaAssetData>
}) {
  return (
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
        <span style={{
          fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#1a1a1a', fontFamily: 'Georgia, serif', fontWeight: 600,
        }}>
          On-Chain vs TradFi Divergence
        </span>
        <span style={{ fontSize: '10px', color: '#9b8e80', fontFamily: 'Georgia, serif' }}>
          Liquid markets only · SPYx $3.0M · QQQx $2.3M
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '160px 130px 180px 130px 120px',
        gap: '16px', paddingBottom: '8px',
        fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#9b8e80', borderBottom: '1px solid #ccc5b5',
        fontFamily: 'Georgia, serif',
      }}>
        <span>Asset</span>
        <span>TradFi</span>
        <span>Solana · xStocks</span>
        <span style={{ textAlign: 'right' }}>Divergence</span>
        <span style={{ textAlign: 'right' }}>Signal</span>
      </div>

      {assets.map((asset, idx) => {
        const tradfiPrice = tradfiMap[asset.ticker]
        const solanaData = solanaPrices[asset.solanaMint]
        const solanaPrice = solanaData?.price ?? null
        const divergence = tradfiPrice && solanaPrice
          ? computeDivergence(tradfiPrice, solanaPrice)
          : null
        const isDiscount = divergence !== null && divergence < 0
        const isSignificant = divergence !== null && Math.abs(divergence) > asset.noiseThreshold
        const score = divergence !== null
          ? getDivergenceScore(divergence, asset.noiseThreshold, solanaData?.liquidity ?? null)
          : null
        const changePct = changePctMap[asset.ticker]
        const isPositive = changePct >= 0
        const scoreLabel = score?.label === 'Noise' ? 'Tracking' : score?.label

        return (
          <div key={asset.id} style={{
            display: 'grid', gridTemplateColumns: '160px 130px 180px 130px 120px',
            gap: '16px', padding: '16px 0',
            borderBottom: idx < assets.length - 1 ? '1px solid #e8e2d6' : 'none',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
                {asset.label}
              </div>
              <div style={{ fontSize: '10px', color: '#9b8e80', fontWeight: 400, marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                {asset.solanaLabel} on Solana
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
                {tradfiPrice ? tradfiPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
              </div>
              {changePct !== undefined && (
                <div style={{ fontSize: '10px', marginTop: '2px', color: isPositive ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif' }}>
                  {isPositive ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                </div>
              )}
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
                  {solanaData.priceChange24h !== null && (
                    <div style={{ fontSize: '10px', marginTop: '1px', color: solanaData.priceChange24h >= 0 ? '#0D6B52' : '#c0392b', fontFamily: 'Georgia, serif' }}>
                      {solanaData.priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(solanaData.priceChange24h).toFixed(2)}%
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '12px', color: '#ccc' }}>—</div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              {divergence !== null ? (
                <>
                  <div style={{
                    fontSize: '14px', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: isSignificant ? (isDiscount ? '#c0392b' : '#0D6B52') : '#9b8e80',
                    fontFamily: 'Georgia, serif'
                  }}>
                    {divergence > 0 ? '+' : ''}{divergence.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '10px', color: '#9b8e80', marginTop: '2px', fontFamily: 'Georgia, serif' }}>
                    {isDiscount ? 'discount' : 'premium'}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '12px', color: '#ddd' }}>—</div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              {score ? (
                <div style={{ fontSize: '10px', fontWeight: 600, color: score.label === 'Noise' ? '#9b8e80' : score.color, fontFamily: 'Georgia, serif' }}>
                  {scoreLabel}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#ddd' }}>—</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
