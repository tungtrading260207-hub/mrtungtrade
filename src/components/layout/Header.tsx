import { useEffect, useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { formatDateTime } from '../../utils/formatters';

type TabId = 'radar' | 'dashboard' | 'analysis' | 'calc' | 'history' | 'news';
const navItems: Array<{ id: TabId; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'radar', label: 'Radar' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'calc', label: 'Calc' },
  { id: 'history', label: 'History' },
  { id: 'news', label: 'News' },
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
      <div className="header-hero-grid">
        <section className="hero-summary">
          <div className="hero-tag">MR TUNG DNA · MARKET COMMAND</div>
          <h1 className="hero-title">
            Dashboard <span>tiếp cận kèo</span> nhanh nhất
          </h1>
          <p className="hero-copy">
            Luồng thông tin rõ ràng, kèo được lọc chuẩn, hành động ngay trong 1 chạm. Tự động cập nhật mọi biến động
            thị trường Crypto & VN30.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary" onClick={loadRadar}>
              Quét lại ngay
            </button>
            <button type="button" className="secondary-button" onClick={() => setActiveTab('radar')}>
              Xem Radar nhanh
            </button>
          </div>
        </section>

        <section className="hero-cards-grid">
          <article className="hero-card">
            <div className="hero-card-title">Kèo Vàng</div>
            <div className="hero-card-value">{goldCount}</div>
            <div className="hero-card-note">Kèo đạt chuẩn DNA</div>
          </article>
          <article className="hero-card hero-card-strong">
            <div className="hero-card-title">Lượng mã</div>
            <div className="hero-card-value">{gomCount}</div>
            <div className="hero-card-note">Tổng mã đang scan</div>
          </article>
          <article className="hero-card">
            <div className="hero-card-title">Nghịch đảo</div>
            <div className="hero-card-value">{reverseCount}</div>
            <div className="hero-card-note">Mã đi ngược xu hướng</div>
          </article>
          <article className="hero-card hero-card-tiny">
            <div className="hero-card-title">Cập nhật</div>
            <div className="hero-card-value">{formatDateTime(now)}</div>
            <div className="hero-card-note">Thời gian thực</div>
          </article>
        </section>
      </div>

      <div className="header-nav-row header-nav-compact">
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
