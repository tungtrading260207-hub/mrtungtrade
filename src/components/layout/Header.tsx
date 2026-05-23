import useAppStore from '../../store/useAppStore';
import { formatDateTime } from '../../utils/formatters';

export default function Header() {
  const news = useAppStore((state) => state.news);
  const selected = useAppStore((state) => state.selectedAssetId);
  const selectedAsset = useAppStore((state) => state.radarAssets.find((asset) => asset.id === selected));

  return (
    <header className="card" style={{ borderRadius: '0 0 28px 28px', margin: '0 16px 16px' }}>
      <div className="card-title">
        <div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8' }}>mrtungtrade</div>
          <h1 style={{ margin: '8px 0 0', fontSize: 24 }}>Radar Kèo Vàng</h1>
        </div>
        <div className="badge">Realtime</div>
      </div>

      <div className="grid-2" style={{ gap: '16px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div className="card-title">
            <span>Thị trường nổi bật</span>
            <span style={{ fontSize: 12, color: '#8ea5c8' }}>{formatDateTime(new Date())} UTC+7</span>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="metric">
              <strong>{selectedAsset?.symbol ?? '-'}</strong>
              <span>{selectedAsset?.name ?? 'Đang chọn nhanh'}</span>
            </div>
            <div className="metric">
              <strong>{selectedAsset ? selectedAsset.currentPrice.toFixed(4) : '-'}</strong>
              <span>{selectedAsset ? selectedAsset.sourceLabel : ''}</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '18px' }}>
          <div className="card-title">
            <span>Tin tức vĩ mô</span>
            <span style={{ fontSize: 12, color: '#8ea5c8' }}>RSS CafeF</span>
          </div>
          <div className="card-list" style={{ gap: 10, maxHeight: 146, overflow: 'auto' }}>
            {news.slice(0, 3).map((item) => (
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
