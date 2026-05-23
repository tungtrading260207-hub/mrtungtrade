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
  const addCustomAsset = useAppStore((state) => state.addCustomAsset);

  const [manualSymbol, setManualSymbol] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [currentPriceOverride, setCurrentPriceOverride] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [size, setSize] = useState(1);

  const normalizedSymbol = manualSymbol.trim().toUpperCase();
  const selectedAsset = radarAssets.find((item) => item.id === selectedAssetId);
  const searchedAsset = radarAssets.find((item) => item.symbol.toUpperCase() === normalizedSymbol || item.id.toUpperCase() === normalizedSymbol);

  const currentAsset = searchedAsset || selectedAsset;
  const inferredType: 'crypto' | 'vn-stock' = normalizedSymbol.endsWith('USDT') || normalizedSymbol.endsWith('BTC') || normalizedSymbol.endsWith('ETH') || normalizedSymbol.endsWith('BNB') || normalizedSymbol.endsWith('SOL') || normalizedSymbol.endsWith('XRP') || normalizedSymbol.endsWith('ADA') || normalizedSymbol.endsWith('DOGE')
    ? 'crypto'
    : /^[A-Z]{2,5}$/.test(normalizedSymbol)
    ? 'vn-stock'
    : 'crypto';

  const currentPrice = currentAsset?.currentPrice ?? Number(currentPriceOverride) ?? 0;
  const assetType = currentAsset?.type ?? inferredType;
  const assetName = currentAsset?.name ?? normalizedSymbol;

  const { pl, pct } = useMemo(() => {
    if (!entryPrice || !currentPrice) return { pl: 0, pct: 0 };
    return computePnL(Number(entryPrice), currentPrice, leverage, direction);
  }, [entryPrice, currentPrice, leverage, direction]);

  const handleSave = () => {
    const symbol = normalizedSymbol || selectedAsset?.symbol;
    if (!symbol || !entryPrice || !currentPrice) return;

    let assetId = currentAsset?.id ?? symbol;
    if (!currentAsset) {
      const customAsset = {
        id: assetId,
        symbol,
        name: symbol,
        type: assetType,
        currentPrice,
        priceChange24h: 0,
        lastUpdated: new Date().toISOString(),
        sourceLabel: 'Manual Input',
        sourceDetails: [`Tự nhập - phân loại ${assetType}`],
        confidence: 30,
        raw: { manual: true },
        score: 15,
      };
      addCustomAsset(customAsset);
    }

    const record = {
      id: `${assetId}-${Date.now()}`,
      assetId,
      assetName,
      entryPrice: Number(entryPrice),
      currentPrice,
      leverage,
      size,
      direction,
      createdAt: new Date().toISOString(),
    };
    addTrade(record);
    setEntryPrice('');
    setCurrentPriceOverride('');
    setManualSymbol('');
  };

  return (
    <section className="page-section">
      <div className="card">
        <div className="card-title">
          <span>Máy tính P&L & Lưu vị thế</span>
          <span>Nhập mã và vị thế để web quản lý</span>
        </div>
        <div className="grid-2">
          <div className="card" style={{ padding: '18px' }}>
            <div className="input-group">
              <label>
                Mã tài sản
                <input
                  value={manualSymbol}
                  onChange={(event) => setManualSymbol(event.target.value)}
                  placeholder={selectedAsset?.symbol ?? 'VD: BTC, SSI, VCB'}
                />
              </label>
              <label>
                Loại tài sản
                <input value={assetType} disabled />
              </label>
              <label>
                Giá hiện tại
                <input
                  type="number"
                  placeholder={currentAsset ? currentAsset.currentPrice.toFixed(4) : 'Nhập giá hiện tại'}
                  value={currentAsset ? currentAsset.currentPrice.toString() : currentPriceOverride}
                  onChange={(event) => setCurrentPriceOverride(event.target.value)}
                  disabled={!!currentAsset}
                />
              </label>
              <label>
                Giá vào lệnh
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
                Kích thước
                <input
                  type="number"
                  min={1}
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                />
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
                <strong>{formatCurrency(pl, assetType === 'crypto' ? 'USD' : 'VND')}</strong>
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
              <button className="primary" type="button" onClick={handleSave} disabled={!normalizedSymbol || !entryPrice || !currentPrice}>
                Lưu vị thế vào lịch sử
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
