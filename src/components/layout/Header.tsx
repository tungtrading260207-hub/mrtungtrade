import useAppStore from '../../store/useAppStore';
import { formatDateTime } from '../../utils/formatters';

type TabId = 'dashboard' | 'analysis' | 'calc' | 'history';
const navItems: Array<{ id: TabId; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'calc', label: 'Calculator' },
  { id: 'history', label: 'History' },
];

export default function Header() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const news = useAppStore((state) => state.news);
  const radarAssets = useAppStore((state) => state.radarAssets);
  const topAsset = radarAssets[0];
  const cryptoCount = radarAssets.filter((asset) => asset.type === 'crypto').length;
  const vnCount = radarAssets.filter((asset) => asset.type === 'vn-stock').length;
  const topConfidence = topAsset?.confidence ?? 0;

  return (
    <header className="app-header">
      <div className="header-top">
        <div>
          <div className="label-hero">MrTungTrade • Aura Edition</div>
          <h1>VIP Radar thị trường</h1>
          <p className="hero-subtitle">Tách riêng crypto và chứng khoán Việt Nam. Focus vào kèo vàng, tín hiệu và độ tin cậy.</p>
        </div>
        <div className="top-badges">
          <span className="badge">{cryptoCount} Crypto</span>
          <span className="badge">{vnCount} VN Stock</span>
          <span className="badge">Top Confidence {topConfidence}%</span>
        </div>
      </div>

      <div className="top-toolbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="header-grid">
        <div className="header-card">
          <div className="card-title">
            <span>Thông tin nhanh</span>
            <span className="badge">Cập nhật tức thì</span>
          </div>
          <div className="asset-meta" style={{ gap: 12 }}>
            <span>Top 1: {topAsset ? `${topAsset.symbol} (${topAsset.sourceLabel})` : 'Chưa có dữ liệu'}</span>
            <span>Giá hiện tại: {topAsset ? topAsset.currentPrice.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '-'}</span>
            <span>Triển vọng: {topAsset ? `${topAsset.score} điểm` : '---'}</span>
            <span>Confidence: {topAsset ? `${topAsset.confidence ?? 0}%` : '---'}</span>
          </div>
        </div>

        <div className="header-card">
          <div className="card-title">
            <span>Trend & tin tức</span>
            <span className="badge">Multi-source</span>
          </div>
          <div className="card-list" style={{ gap: 10, maxHeight: 175, overflow: 'auto' }}>
            {news.slice(0, 4).map((item) => (
              <a key={item.link} href={item.link} target="_blank" rel="noreferrer" className="news-link">
                {item.title}
              </a>
            ))}
            {news.length === 0 && <div className="muted-text">Đang tải tin tức, vui lòng đợi.</div>}
          </div>
        </div>
      </div>
    </header>
  );
}
