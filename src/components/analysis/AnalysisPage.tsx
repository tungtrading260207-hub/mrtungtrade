import useAppStore from '../../store/useAppStore';
import TradingViewChart from '../common/TradingViewChart';
import { formatCurrency, formatDateTime, formatPercent } from '../../utils/formatters';

function signalColor(signal: string) {
  if (typeof window === 'undefined') {
    if (signal === 'KÈO VÀNG') return '#b38a2e';
    if (signal === 'CHỜ KÍCH NỔ') return '#72d6ff';
    return '#94a3b8';
  }
  const root = getComputedStyle(document.documentElement);
  const accent = root.getPropertyValue('--accent') || '#b38a2e';
  if (signal === 'KÈO VÀNG') return accent.trim();
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
          <div className="badge" style={{ background: signalColor(analysis.signal), color: '#091018' }}>
            {analysis.signal}
          </div>
        </div>
        {!asset.hasLivePrice && (
          <div className="card" style={{ background: 'rgba(234, 79, 49, 0.08)', border: '1px solid rgba(234, 79, 49, 0.18)', marginBottom: 16, padding: 14 }}>
            <strong style={{ color: '#d45f4d' }}>Lưu ý:</strong> Mã này chưa có giá realtime. Phân tích chỉ mang tính tham khảo và cần xác thực giá thực trước khi vào lệnh.
          </div>
        )}

        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ padding: '16px' }}>
            <TradingViewChart symbol={asset.symbol} type={asset.type} />
          </div>

          <div className="grid-2">
            <div className="card" style={{ padding: '18px' }}>
              <div className="card-title">
                <span>Thông số chiến thuật</span>
                <span className="badge">{analysis.score} điểm</span>
              </div>
              <div className="asset-meta" style={{ gap: '10px' }}>
                <span>Giá hiện tại: {asset.currentPrice ? formatCurrency(asset.currentPrice, asset.type === 'crypto' ? 'USD' : 'VND') : 'Không có dữ liệu'}</span>
                <span>Biến động 24h: {formatPercent(asset.priceChange24h)}</span>
                <span>Biến động 7d: {asset.priceChange7d !== undefined ? formatPercent(asset.priceChange7d) : 'Chưa có'}</span>
                <span>Vốn hóa: {asset.marketCap ? formatCurrency(asset.marketCap, 'USD') : 'Không có dữ liệu'}</span>
                <span className={`confidence-badge ${asset.confidence && asset.confidence >= 70 ? 'gold' : ''}`} data-tooltip={asset.sourceDetails?.join(' | ')}>
                  {asset.confidence ? `${asset.confidence}%` : 'N/A'}
                </span>
                <span>Sources: {asset.sourceLabel}</span>
                <span>Cập nhật: {formatDateTime(asset.lastUpdated)}</span>
              </div>
            </div>

            <div className="card" style={{ padding: '18px' }}>
              <div className="card-title">
                <span>Vùng entry / stop / TP</span>
              </div>
              <div className="asset-meta" style={{ gap: '10px' }}>
                <span>Entry đề xuất: {formatCurrency(entryMin, asset.type === 'crypto' ? 'USD' : 'VND')} - {formatCurrency(entryMax, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
                <span>Stop loss: {formatCurrency(stopLoss, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
                <span>Take profit: {formatCurrency(takeProfit, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
                <span>Tỷ lệ R:R tối thiểu: 1:2</span>
                <span>Chiến lược: ưu tiên lệnh có điểm &gt;= 70</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16, padding: '18px' }}>
            <div className="card-title">
              <span>Nguồn kiểm tra chéo</span>
            </div>
            <div className="asset-meta" style={{ display: 'grid', gap: 8, fontSize: 13, color: '#94a3b8' }}>
              {asset.sourceDetails?.map((detail, index) => (
                <span key={index}>{detail}</span>
              ))}
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
      </div>
    </section>
  );
}
