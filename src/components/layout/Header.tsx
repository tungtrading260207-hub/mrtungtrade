import useAppStore from '../../store/useAppStore';
import { formatDateTime } from '../../utils/formatters';

export default function Header() {
  const news = useAppStore((state) => state.news);
  const selected = useAppStore((state) => state.selectedAssetId);
  const selectedAsset = useAppStore((state) => state.radarAssets.find((asset) => asset.id === selected));
  const radarAssets = useAppStore((state) => state.radarAssets);

  const topAsset = radarAssets[0];
  const cryptoCount = radarAssets.filter((asset) => asset.type === 'crypto').length;
  const vnCount = radarAssets.filter((asset) => asset.type === 'vn-stock').length;

  return (
    <header className="card" style={{ borderRadius: '0 0 28px 28px', margin: '0 18px 18px' }}>
      <div className="card-title">
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8' }}>MrTungTrade | VIP Radar Cockpit</div>
          <h1 style={{ margin: '10px 0 0', fontSize: 28 }}>Thị trường Tài chính cao cấp</h1>
        </div>
        <div className="badge">Đồng bộ dữ liệu</div>
      </div>

      <div className="grid-2" style={{ gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-title">
            <span>Đầu bài hôm nay</span>
            <span style={{ fontSize: 12, color: '#8ea5c8' }}>{formatDateTime(new Date())} UTC+7</span>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="metric">
              <strong>{topAsset?.symbol ?? '-'}</strong>
              <span>{topAsset?.name ?? 'Chưa xác định'}</span>
            </div>
            <div className="metric">
              <strong>{topAsset ? topAsset.currentPrice.toLocaleString('vi-VN', { maximumFractionDigits: 4 }) : '-'}</strong>
              <span>{topAsset ? topAsset.sourceLabel : ''}</span>
            </div>
            <div className="asset-meta" style={{ display: 'grid', gap: 8 }}>
              <span>Số mã Crypto: {cryptoCount}</span>
              <span>Số mã VN Stock: {vnCount}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div className="card-title">
            <span>Tin tức & vĩ mô</span>
            <span style={{ fontSize: 12, color: '#8ea5c8' }}>Nhiều nguồn RSS</span>
          </div>
          <div className="card-list" style={{ gap: 10, maxHeight: 175, overflow: 'auto' }}>
            {news.slice(0, 4).map((item) => (
              <a key={item.link} href={item.link} target="_blank" rel="noreferrer" style={{ color: '#d9e2ff', fontSize: 13, textDecoration: 'none' }}>
                {item.title}
              </a>
            ))}
            {news.length === 0 && <div style={{ color: '#8892b0' }}>Không có tin mới hoặc đang tải.</div>}
          </div>
        </div>
      </div>
    </header>
  );
}
