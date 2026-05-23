import useAppStore from '../../store/useAppStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

function signalLabel(score: number) {
  if (score >= 70) return 'KÈO VÀNG';
  if (score >= 55) return 'CHỜ KÍCH NỔ';
  return 'GIỮ VỊ THẾ';
}

function AssetTable({ title, assets }: { title: string; assets: any[] }) {
  return (
    <div className="card">
      <div className="card-title">
        <span>{title}</span>
        <span>{assets.length} mục</span>
      </div>
      <div className="card-list">
        {assets.map((asset) => (
          <button key={asset.id} type="button" className="asset-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="asset-title"><strong>{asset.symbol}</strong></div>
              <div className="asset-meta"><span>{asset.sourceLabel}</span> <span className={`confidence-badge ${asset.confidence && asset.confidence >= 70 ? 'gold' : ''}`} data-tooltip={asset.sourceDetails?.join(' | ')}>{asset.confidence ? `${asset.confidence}%` : 'N/A'}</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>{formatCurrency(asset.currentPrice, asset.type === 'crypto' ? 'USD' : 'VND')}</div>
              <div className={asset.priceChange24h >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(asset.priceChange24h)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RadarPage() {
  const radarAssets = useAppStore((s) => s.radarAssets);
  const highlightAssets = radarAssets.slice(0, 3);
  const cryptoAssets = radarAssets.filter((a) => a.type === 'crypto').slice(0, 12);
  const vnAssets = radarAssets.filter((a) => a.type === 'vn-stock').slice(0, 12);

  return (
    <section className="page-section">
      <div className="card" style={{ padding: 18 }}>
        <div className="card-title"><span>Kèo vàng chọn lọc</span><span className="badge">Focus</span></div>
        <div className="card-list">
          {highlightAssets.map((asset) => (
            <div key={asset.id} className="asset-row" style={{ padding: 14 }}>
              <div>
                <strong>{asset.symbol}</strong>
                <div className="asset-meta"><span>{asset.name}</span> <span className={`confidence-badge ${asset.confidence && asset.confidence >= 70 ? 'gold' : ''}`} data-tooltip={asset.sourceDetails?.join(' | ')}>{asset.confidence ? `${asset.confidence}%` : 'N/A'}</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="badge">{signalLabel(asset.score)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <AssetTable title="Kèo Crypto" assets={cryptoAssets} />
        <AssetTable title="Kèo Chứng khoán Việt" assets={vnAssets} />
      </div>
    </section>
  );
}
