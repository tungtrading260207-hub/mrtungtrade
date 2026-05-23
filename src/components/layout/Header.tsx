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
    () => radarAssets.filter((asset) => (asset.score ?? 0) >= 70).length,
    [radarAssets],
  );

  const gomCount = radarAssets.length;
  const reverseCount = useMemo(
    () => radarAssets.filter((asset) => (asset.priceChange24h ?? 0) < 0).length,
    [radarAssets],
  );

  return (
    <header className="app-header">
      <div className="header-top header-hero">
        <div className="hero-copy">
          <div className="label-hero">MR TUNG DNA · AUTO-SCAN ENGINE</div>
          <div className="hero-title-row">
            <h1>
              Phát hiện <span className="hero-highlight">{goldCount}</span> Kèo Vàng
            </h1>
          </div>
          <p className="hero-subtitle">
            Hệ thống tự động quét toàn bộ thị trường Binance (Crypto) và VN30 (Chứng khoán). Cập nhật lúc: {formatDateTime(now)}
          </p>
        </div>

        <div className="summary-cards">
          <article className="summary-widget">
            <div className="summary-widget-title">VÀNG</div>
            <div className="summary-widget-value">{goldCount}</div>
            <div className="summary-widget-note">Kèo đạt chuẩn DNA</div>
          </article>
          <article className="summary-widget">
            <div className="summary-widget-title">GOM</div>
            <div className="summary-widget-value">{gomCount}</div>
            <div className="summary-widget-note">Tổng mã đang theo dõi</div>
          </article>
          <article className="summary-widget">
            <div className="summary-widget-title danger">KÈO NGHỊCH ĐẢO</div>
            <div className="summary-widget-value">{reverseCount}</div>
            <div className="summary-widget-note">Biến động ngược xu hướng</div>
          </article>
          <button type="button" className="outline-button" onClick={loadRadar}>
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
    </header>
  );
}
