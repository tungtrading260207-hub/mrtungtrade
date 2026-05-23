import { useMemo } from 'react';
import useAppStore from '../../store/useAppStore';

const cryptoKeywords = /crypto|bitcoin|btc|ethereum|eth|binance|coin|altcoin|defi|blockchain|token|stablecoin/i;

export default function NewsPage() {
  const news = useAppStore((s) => s.news);

  const cryptoNews = useMemo(
    () => news.filter((item) => cryptoKeywords.test(item.title)),
    [news],
  );

  const vnStockNews = useMemo(
    () => news.filter((item) => !cryptoKeywords.test(item.title)),
    [news],
  );

  return (
    <section className="page-section">
      <div className="card">
        <div className="card-title">
          <span>News Center</span>
          <span className="badge">Phân loại Crypto / VN Stock</span>
        </div>
        <div style={{ marginBottom: 20, color: '#94a3b8', fontSize: 13 }}>
          Tin tức được phân loại tự động theo tiêu đề. Nếu bạn muốn xem tin tức chi tiết thị trường, chọn mục tương ứng.
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-title">
            <span>Crypto News</span>
            <span className="badge">Top stories</span>
          </div>
          <div className="card-list" style={{ gap: 10, maxHeight: 520, overflow: 'auto' }}>
            {cryptoNews.length === 0 ? (
              <div className="muted-text">Không tìm thấy tin crypto trong nguồn hiện tại.</div>
            ) : (
              cryptoNews.slice(0, 20).map((item) => (
                <a key={item.link} href={item.link} target="_blank" rel="noreferrer" className="news-link">
                  <div style={{ display: 'grid', gap: 6 }}>
                    <strong style={{ fontSize: 14 }}>{item.title}</strong>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.pubDate}</span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Vietnam Stock News</span>
            <span className="badge">Chứng khoán Việt</span>
          </div>
          <div className="card-list" style={{ gap: 10, maxHeight: 520, overflow: 'auto' }}>
            {vnStockNews.length === 0 ? (
              <div className="muted-text">Không tìm thấy tin chứng khoán Việt trong nguồn hiện tại.</div>
            ) : (
              vnStockNews.slice(0, 20).map((item) => (
                <a key={item.link} href={item.link} target="_blank" rel="noreferrer" className="news-link">
                  <div style={{ display: 'grid', gap: 6 }}>
                    <strong style={{ fontSize: 14 }}>{item.title}</strong>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.pubDate}</span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
