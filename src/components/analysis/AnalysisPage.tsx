import useAppStore from '../../store/useAppStore';
import { formatCurrency, formatDateTime, formatPercent } from '../../utils/formatters';

function signalColor(signal: string) {
  if (signal === 'KÈO VÀNG') return '#f1c452';
  if (signal === 'CHỜ KÍCH NỔ') return '#72d6ff';
  return '#94a3b8';
}

export default function AnalysisPage() {
  const selectedAssetId = useAppStore((state) => state.selectedAssetId);
  const radarAssets = useAppStore((state) => state.radarAssets);
  const analysis = useAppStore((state) => state.analysis);
  const asset = radarAssets.find((item) => item.id === selectedAssetId);

  if (!asset || !analysis) {
    return (
      <section className="page-section">
        <div className="card">Chưa có mã được chọn. Vui lòng trở về Dashboard và chọn mã.</div>
      </section>
    );
  }

  const riskBuffer = asset.currentPrice * 0.015;
  const entryMin = asset.currentPrice - riskBuffer;
  const entryMax = asset.currentPrice + riskBuffer;
  const stopLoss = asset.currentPrice - riskBuffer * 2;
  const takeProfit = asset.currentPrice + riskBuffer * 3;
  const progress = Math.round((analysis.score / 100) * 100);

  return (
    <section className="page-section">
      <div className="card">
        <div className="card-title">
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Phân tích chi tiết</div>
            <h2 style={{ margin: '8px 0 0' }}>{asset.symbol} - {asset.name}</h2>
          </div>
          <div className="badge" style={{ background: signalColor(analysis.signal), color: '#071018' }}>
            {analysis.signal}
          </div>
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: '18px' }}>
            <div className="card-title">
              <span>Thông số chiến thuật</span>
              <span className="badge">{analysis.score} điểm</span>
            </div>
            <div className="asset-meta" style={{ gap: '10px' }}>
              <span>Giá hiện tại: {formatCurrency(asset.currentPrice, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
              <span>Biến động 24h: {formatPercent(asset.priceChange24h)}</span>
              <span>Vốn hóa: {asset.marketCap ? formatCurrency(asset.marketCap, 'USD') : 'Không có dữ liệu'}</span>
              <span>Khối lượng 24h: {asset.volume24h ? formatCurrency(asset.volume24h, 'USD') : 'Không có dữ liệu'}</span>
              <span>Source: {asset.sourceLabel}</span>
              <span>Cập nhật: {formatDateTime(asset.lastUpdated)}</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: '#94a3b8' }}>
                <span>Tiến trình điểm</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ width: `${progress}%`, height: '100%', borderRadius: 999, background: '#f1c452' }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px' }}>
            <div className="card-title">
              <span>Vùng entry / stop / TP</span>
            </div>
            <div className="asset-meta" style={{ gap: '10px' }}>
              <span>Vùng entry đề xuất: {formatCurrency(entryMin, asset.type === 'crypto' ? 'USD' : 'VND')} - {formatCurrency(entryMax, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
              <span>Stop loss gợi ý: {formatCurrency(stopLoss, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
              <span>Take profit gợi ý: {formatCurrency(takeProfit, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
              <span>Tỷ lệ R:R tối thiểu: 1:2</span>
              <span>Chiến lược: ưu tiên lệnh có điểm &gt;= 70</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16, padding: '18px' }}>
          <div className="card-title">
            <span>10 bước phân tích</span>
          </div>
          <div className="card-list" style={{ gap: 10 }}>
            {analysis.steps.map((step) => (
              <div key={step.title} className="card" style={{ padding: '14px', display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{step.title}</strong>
                  <span className="badge" style={{ opacity: step.passed ? 1 : 0.55 }}>
                    {step.passed ? 'OK' : 'Yếu'}
                  </span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
