import useAppStore from '../../store/useAppStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

function signalLabel(score: number) {
  if (score >= 70) return 'KÈO VÀNG';
  if (score >= 55) return 'CHỜ KÍCH NỔ';
  return 'GIỮ VỊ THẾ';
}

function AssetTable({ title, assets }: { title: string; assets: Array<any> }) {
  return (
    <div className="card">
      <div className="card-title">
        <span>{title}</span>
        <span>{assets.length} mục</span>
      </div>
      <div className="card-list">
        {assets.map((asset, index) => (
          <div key={asset.id} className="asset-row" style={{ padding: '14px 18px' }}>
            <div>
              <div className="asset-title" style={{ gap: 10 }}>
                <strong>{index + 1}. {asset.symbol}</strong>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{signalLabel(asset.score)}</span>
              </div>
              <div className="asset-meta" style={{ gap: 8 }}>
                <span>{asset.sourceLabel}</span>
                <span>{asset.confidence ? `Tin cậy ${asset.confidence}%` : 'Tin cậy chưa rõ'}</span>
              </div>
            </div>
            <div className="asset-value" style={{ minWidth: 108, textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(asset.currentPrice, asset.type === 'crypto' ? 'USD' : 'VND')}</div>
              <div className={asset.priceChange24h >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(asset.priceChange24h)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const radarAssets = useAppStore((state) => state.radarAssets);
  const selectedAssetId = useAppStore((state) => state.selectedAssetId);
  const selectAsset = useAppStore((state) => state.selectAsset);

  const cryptoAssets = radarAssets.filter((asset) => asset.type === 'crypto').slice(0, 6);
  const vnAssets = radarAssets.filter((asset) => asset.type === 'vn-stock').slice(0, 6);
  const highlightAssets = radarAssets.slice(0, 3);

  return (
    <section className="page-section">
      <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(28, 38, 62, 0.96), rgba(10, 11, 24, 0.9))', border: '1px solid rgba(203, 171, 79, 0.22)' }}>
        <div className="card-title">
          <span>Kèo vàng chọn lọc</span>
          <span className="badge">Focus signal</span>
        </div>
        <div className="card-list">
          {highlightAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={`asset-row ${selectedAssetId === asset.id ? 'active' : ''}`}
              onClick={() => selectAsset(asset.id)}
              style={{ padding: '18px' }}
            >
              <div>
                <div className="asset-title">
                  <div>
                    <strong>{asset.symbol}</strong>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>{asset.name}</div>
                  </div>
                </div>
                <div className="asset-meta">
                  <span>{asset.sourceLabel}</span>
                  <span>{asset.confidence ? `Confidence ${asset.confidence}%` : 'Tin cậy chưa rõ'}</span>
                </div>
              </div>
              <div className="asset-value">
                <div className={asset.priceChange24h >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(asset.priceChange24h)}</div>
                <div className="badge">{signalLabel(asset.score)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 18 }}>
        <AssetTable title="Kèo Crypto" assets={cryptoAssets} />
        <AssetTable title="Kèo Chứng khoán Việt" assets={vnAssets} />
      </div>

      <div className="card">
        <div className="card-title">
          <span>Danh sách mở rộng</span>
          <span>Chọn để xem phân tích</span>
        </div>
        <div className="card-list">
          {radarAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={`asset-row ${selectedAssetId === asset.id ? 'active' : ''}`}
              onClick={() => selectAsset(asset.id)}
            >
              <div>
                <div className="asset-title">
                  <strong>{asset.symbol}</strong>
                </div>
                <div className="asset-meta">
                  <span>{asset.type === 'crypto' ? 'Crypto' : 'VN Stock'}</span>
                  <span>{asset.sourceLabel}</span>
                </div>
              </div>
              <div className="asset-value">
                <div className={asset.priceChange24h >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(asset.priceChange24h)}</div>
                <div className="badge">{asset.score}</div>
              </div>
            </button>
          ))}
          {radarAssets.length === 0 && <div style={{ color: '#8892b0' }}>Không tìm thấy dữ liệu.</div>}
        </div>
      </div>
    </section>
  );
}
