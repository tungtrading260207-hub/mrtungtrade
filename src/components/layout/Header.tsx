import useAppStore from '../../store/useAppStore';
import { formatDateTime } from '../../utils/formatters';

type TabId = 'radar' | 'dashboard' | 'analysis' | 'calc' | 'history' | 'news';
const navItems: Array<{ id: TabId; label: string }> = [
  { id: 'radar', label: 'Radar' },
  { id: 'news', label: 'News' },
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
        <div className="header-brand">
          <div className="label-hero">MR TUNG TRADE</div>
          <div className="header-title-row">
            <h1>VIP Radar</h1>
            <span className="hero-tag">Crypto + VN30</span>
          </div>
          <p className="hero-subtitle">Radar nhanh mã tăng mạnh và kèo vàng tin cậy.</p>
        </div>

        <div className="top-badges">
          <span className="badge badge-small">{cryptoCount} Crypto</span>
          <span className="badge badge-small">{vnCount} VN Stock</span>
          <span className="badge badge-small">Top {topConfidence}%</span>
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

      <div className="header-grid compact">
        <div className="header-card">
          <div className="card-title compact-title">
            <span>Thông tin nhanh</span>
            <span className="badge badge-small">Live</span>
          </div>
          <div className="asset-meta" style={{ gap: 10, flexWrap: 'wrap' }}>
            <span>Top 1: {topAsset ? `${topAsset.symbol}` : '---'}</span>
            <span>{topAsset ? `${topAsset.currentPrice.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}` : '-'}</span>
            <span>{topAsset ? `${topAsset.score} điểm` : '---'}</span>
            <span>{topAsset ? `${topAsset.confidence ?? 0}% tin cậy` : '---'}</span>
          </div>
        </div>

        <div className="header-card">
          <div className="card-title compact-title">
            <span>Trend</span>
            <span className="badge badge-small">News</span>
          </div>
          <div className="card-list" style={{ gap: 8, maxHeight: 148, overflow: 'auto' }}>
            {news.slice(0, 3).map((item) => (
              <a key={item.link} href={item.link} target="_blank" rel="noreferrer" className="news-link">
                {item.title}
              </a>
            ))}
            {news.length === 0 && <div className="muted-text">Đang tải tin tức...</div>}
          </div>
        </div>
      </div>
    </header>
  );
}
