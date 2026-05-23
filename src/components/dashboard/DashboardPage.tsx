import useAppStore from '../../store/useAppStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

function signalLabel(score: number) {
  if (score >= 70) return 'KÈO VÀNG';
  if (score >= 55) return 'CHỜ KÍCH NỔ';
  return 'GIỮ VỊ THẾ';
}

export default function DashboardPage() {
  const radarAssets = useAppStore((state) => state.radarAssets);
  const selectedAssetId = useAppStore((state) => state.selectedAssetId);
  const selectAsset = useAppStore((state) => state.selectAsset);

  const top10 = radarAssets.slice(0, 10);
  const cryptoCount = radarAssets.filter((asset) => asset.type === 'crypto').length;
  const vnCount = radarAssets.filter((asset) => asset.type === 'vn-stock').length;
  const bestAsset = radarAssets[0];

  return (
    <section className="page-section">
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">
            <span>Tổng quan Radar</span>
            <span>{radarAssets.length} mã</span>
          </div>
          <div className="asset-meta" style={{ display: 'grid', gap: 10 }}>
            <span>Số mã Crypto: {cryptoCount}</span>
            <span>Số mã VN Stock: {vnCount}</span>
            <span>Top đầu: {bestAsset ? `${bestAsset.symbol} (${bestAsset.sourceLabel})` : 'Đang tải'}</span>
            <span>Điểm cao nhất: {bestAsset ? bestAsset.score : '-'}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            <span>Chỉ số nhanh</span>
            <span>Top 10 kèo</span>
          </div>
          <div className="card-list">
            {top10.map((asset, index) => (
              <div key={asset.id} className="asset-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '14px' }}>
                <div>
                  <div className="asset-title" style={{ gap: 8 }}>
                    <strong>{index + 1}. {asset.symbol}</strong>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{signalLabel(asset.score)}</span>
                  </div>
                  <div className="asset-meta" style={{ gap: 6 }}>
                    <span>{asset.sourceLabel}</span>
                    <span>{formatCurrency(asset.currentPrice, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
                  </div>
                </div>
                <div className="badge">{asset.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Danh sách lựa chọn</span>
          <span>Chọn mã để xem phân tích chi tiết</span>
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
                  <div>
                    <strong>{asset.symbol}</strong>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{asset.name}</div>
                  </div>
                </div>
                <div className="asset-meta">
                  <span>{asset.sourceLabel}</span>
                  <span>{formatCurrency(asset.currentPrice, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
                </div>
              </div>
              <div className="asset-value">
                <div className={asset.priceChange24h >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(asset.priceChange24h)}</div>
                <div className="badge">{signalLabel(asset.score)}</div>
              </div>
            </button>
          ))}
          {radarAssets.length === 0 && <div style={{ color: '#8892b0' }}>Không tìm thấy dữ liệu.</div>}
        </div>
      </div>
    </section>
  );
}
