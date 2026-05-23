import { useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

function computePnL(entry: number, current: number, leverage: number, direction: 'LONG' | 'SHORT') {
  const delta = direction === 'LONG' ? current - entry : entry - current;
  const pl = delta * leverage;
  const pct = (delta / entry) * 100;
  return { pl, pct };
}

export default function CalcPage() {
  const selectedAssetId = useAppStore((state) => state.selectedAssetId);
  const radarAssets = useAppStore((state) => state.radarAssets);
  const addTrade = useAppStore((state) => state.addTrade);
  const asset = radarAssets.find((item) => item.id === selectedAssetId);

  const [entryPrice, setEntryPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');

  const currentPrice = asset?.currentPrice ?? 0;
  const { pl, pct } = useMemo(() => {
    if (!entryPrice || !currentPrice) return { pl: 0, pct: 0 };
    return computePnL(Number(entryPrice), currentPrice, leverage, direction);
  }, [entryPrice, currentPrice, leverage, direction]);

  const handleSave = () => {
    if (!asset || !entryPrice) return;
    const record = {
      id: `${asset.id}-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      entryPrice: Number(entryPrice),
      currentPrice,
      leverage,
      size: 1,
      direction,
      createdAt: new Date().toISOString(),
    };
    addTrade(record);
    setEntryPrice('');
  };

  return (
    <section className="page-section">
      <div className="card">
        <div className="card-title">
          <span>Máy tính P&L</span>
          <span>Điền giá entry và đòn bẩy</span>
        </div>
        <div className="grid-2">
          <div className="card" style={{ padding: '18px' }}>
            <div className="input-group">
              <label>
                Mã tài sản
                <input value={asset?.symbol ?? ''} disabled />
              </label>
              <label>
                Giá hiện tại
                <input value={currentPrice ? currentPrice.toFixed(4) : ''} disabled />
              </label>
              <label>
                Giả sử vào lệnh
                <input
                  type="number"
                  placeholder="Giá vào lệnh"
                  value={entryPrice}
                  onChange={(event) => setEntryPrice(event.target.value)}
                />
              </label>
              <label>
                Đòn bẩy
                <select value={leverage} onChange={(event) => setLeverage(Number(event.target.value))}>
                  {[1, 5, 10, 20].map((value) => (
                    <option key={value} value={value}>
                      {value}x
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Chiều lệnh
                <select value={direction} onChange={(event) => setDirection(event.target.value as 'LONG' | 'SHORT')}>
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </label>
            </div>
          </div>
          <div className="card" style={{ padding: '18px' }}>
            <div className="card-title">
              <span>Kết quả P&L</span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="metric">
                <strong>{formatCurrency(pl, asset?.type === 'crypto' ? 'USD' : 'VND')}</strong>
                <span>Lợi nhuận ước tính</span>
              </div>
              <div className="metric">
                <strong className={pct >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(pct)}</strong>
                <span>Tỷ lệ %</span>
              </div>
              <div className="metric">
                <strong>{direction}</strong>
                <span>Chiều lệnh</span>
              </div>
              <button className="primary" type="button" onClick={handleSave} disabled={!asset || !entryPrice}>
                Lưu vị thế
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
