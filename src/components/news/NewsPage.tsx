import useAppStore from '../../store/useAppStore';

export default function NewsPage() {
  const news = useAppStore((s) => s.news);

  return (
    <section className="page-section">
      <div className="card">
        <div className="card-title">
          <span>Bảng Tin Tức</span>
          <span className="badge">RSS & Headlines</span>
        </div>
        <div className="card-list" style={{ gap: 10 }}>
          {news.length === 0 ? (
            <div className="muted-text">Không có tin tức. Vui lòng tải lại hoặc kiểm tra kết nối.</div>
          ) : (
            news.slice(0, 40).map((item) => (
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
    </section>
  );
}
