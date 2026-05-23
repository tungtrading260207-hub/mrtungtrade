import { useEffect, useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { formatDateTime } from '../../utils/formatters';

type TabId = 'radar' | 'dashboard' | 'analysis' | 'calc' | 'history' | 'news';
const navItems: Array<{ id: TabId; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'radar', label: 'Radar' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'news', label: 'News' },
  { id: 'history', label: 'History' },
];

export default function Header() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const loadRadar = useAppStore((state) => state.loadRadar);
  const radarAssets = useAppStore((state) => state.radarAssets);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const goldCount = useMemo(
    () => radarAssets.filter((asset) => asset.score >= 70).length,
    [radarAssets],
  );

  const gomCount = radarAssets.length;
  const reverseCount = useMemo(
    () => radarAssets.filter((asset) => asset.priceChange24h !== undefined && asset.priceChange24h < 0).length,
    [radarAssets],
  );
  const topAsset = radarAssets[0];

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="header-brand">
          <div className="label-hero">MR TUNG DNA · AUTO-SCAN ENGINE</div>
          <div className="header-title-row">
            <h1>
              Phát hiện <span className="hero-highlight">{goldCount}</span> Kèo Vàng
            </h1>
          </div>
          <p className="hero-subtitle">
            Hệ thống tự động quét toàn bộ thị trường Binance (Crypto) và VN30 (Chứng khoán). Cập nhật lúc: {formatDateTime(now)}
          </p>
        </div>

        <div className="header-stat-grid">
          <article className="stat-card">
            <div className="stat-title">VÀNG</div>
            <div className="stat-value">{goldCount}</div>
            <div className="stat-note">Kèo đạt chuẩn DNA</div>
          </article>
          <article className="stat-card">
            <div className="stat-title">GOM</div>
            <div className="stat-value">{gomCount}</div>
            <div className="stat-note">Tổng mã đang theo dõi</div>
          </article>
          <article className="stat-card">
            <div className="stat-title">KÈO NGHỊCH ĐẢO</div>
            <div className="stat-value">{reverseCount}</div>
            <div className="stat-note">Biến động ngược xu hướng</div>
          </article>
        </div>

        <div className="scan-action-row">
          <button type="button" className="primary" onClick={loadRadar}>
            Quét lại ngay
          </button>
        </div>
      </div>

      <div className="top-toolbar header-nav-row">
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
            {Array.isArray(radarAssets) && radarAssets.length > 0 ? (
              radarAssets.slice(0, 3).map((asset) => (
                <div key={asset.id} className="news-link">
                  {asset.symbol} - {asset.priceChange24h ? `${asset.priceChange24h.toFixed(2)}%` : '---'}
                </div>
              ))
            ) : (
              <div className="muted-text">Đang tải tin tức...</div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
