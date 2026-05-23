import { useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { AssetSummary } from '../../types';

function signalLabel(score: number) {
  if (score >= 70) return 'KÈO VÀNG';
  if (score >= 55) return 'CHỜ KÍCH NỔ';
  return 'GIỮ VỊ THẾ';
}

function AssetTable({ title, assets }: { title: string; assets: Array<any> }) {
  return (
    <div className="card">
      <div className="card-title">
        <span>{title}</span>
        <span>{assets.length} mục</span>
      </div>
      <div className="card-list">
        {assets.map((asset, index) => (
          <div key={asset.id} className="asset-row" style={{ padding: '14px 18px' }}>
            <div>
              <div className="asset-title" style={{ gap: 10 }}>
                <strong>{index + 1}. {asset.symbol}</strong>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{signalLabel(asset.score)}</span>
              </div>
              <div className="asset-meta" style={{ gap: 8 }}>
                <span>{asset.sourceLabel}</span>
                <span>{asset.confidence ? `Tin cậy ${asset.confidence}%` : 'Tin cậy chưa rõ'}</span>
              </div>
            </div>
            <div className="asset-value" style={{ minWidth: 108, textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(asset.currentPrice, asset.type === 'crypto' ? 'USD' : 'VND')}</div>
              <div className={asset.priceChange24h >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(asset.priceChange24h)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const radarAssets = useAppStore((state) => state.radarAssets);
  const selectedAssetId = useAppStore((state) => state.selectedAssetId);
  const selectAsset = useAppStore((state) => state.selectAsset);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const addCustomAsset = useAppStore((state) => state.addCustomAsset);
  const watchlistSymbols = useAppStore((state) => state.watchlistSymbols);
  const addWatchlistSymbol = useAppStore((state) => state.addWatchlistSymbol);
  const removeWatchlistSymbol = useAppStore((state) => state.removeWatchlistSymbol);

  const [manualSymbol, setManualSymbol] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [searchedAsset, setSearchedAsset] = useState<AssetSummary | null>(null);

  const inferType = (symbol: string) => {
    const normalized = symbol.trim().toUpperCase();
    if (normalized.endsWith('USDT') || normalized.endsWith('BTC') || normalized.endsWith('ETH') || normalized.endsWith('BNB') || normalized.endsWith('SOL') || normalized.endsWith('XRP') || normalized.endsWith('ADA') || normalized.endsWith('DOGE')) {
      return 'crypto' as const;
    }
    if (normalized.length <= 5 && /^[A-Z]{2,5}$/.test(normalized)) {
      return 'vn-stock' as const;
    }
    return 'crypto' as const;
  };

  const normalizedSymbol = manualSymbol.trim().toUpperCase();
  const matchedAsset = useMemo(
    () => radarAssets.find((asset) => asset.symbol.toUpperCase() === normalizedSymbol || asset.id.toUpperCase() === normalizedSymbol),
    [normalizedSymbol, radarAssets],
  );

  const cryptoAssets = radarAssets.filter((asset) => asset.type === 'crypto').slice(0, 6);
  const vnAssets = radarAssets.filter((asset) => asset.type === 'vn-stock').slice(0, 6);
  const highlightAssets = radarAssets.slice(0, 3);

  const handleSymbolSearch = () => {
    const symbol = normalizedSymbol;
    setSearchMessage('');
    setSearchedAsset(null);
    if (!symbol) {
      setSearchMessage('Nhập mã cần tìm kiếm để bắt đầu.');
      return;
    }
    if (matchedAsset) {
      setSearchedAsset(matchedAsset);
      selectAsset(matchedAsset.id);
      setActiveTab('analysis');
      setSearchMessage(`Đã tìm thấy ${matchedAsset.symbol}. Chuyển sang phân tích chi tiết.`);
      return;
    }

    const inferredType = inferType(symbol);
    const customAsset: AssetSummary = {
      id: symbol,
      symbol,
      name: symbol,
      type: inferredType,
      currentPrice: 0,
      priceChange24h: 0,
      lastUpdated: new Date().toISOString(),
      sourceLabel: 'Manual Input',
      sourceDetails: [`Tự nhập - phân loại ${inferredType}`],
      confidence: 30,
      raw: { manual: true },
      score: 15,
    };
    addCustomAsset(customAsset);
    setSearchedAsset(customAsset);
    selectAsset(customAsset.id);
    setActiveTab('analysis');
    setSearchMessage(`Đã tự động nhận diện ${symbol} là ${inferredType}. Chuyển sang phân tích chi tiết.`);
  };

  const handleAddWatchlist = () => {
    if (!searchedAsset) {
      setSearchMessage('Vui lòng tìm mã trước khi thêm vào watchlist.');
      return;
    }
    addWatchlistSymbol(searchedAsset.symbol);
    setSearchMessage(`Đã thêm ${searchedAsset.symbol} vào watchlist.`);
  };

  return (
    <section className="page-section">
      <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(28, 38, 62, 0.96), rgba(10, 11, 24, 0.9))', border: '1px solid rgba(203, 171, 79, 0.22)' }}>
        <div className="card-title">
          <span>Kèo vàng chọn lọc</span>
          <span className="badge">Focus signal</span>
        </div>
        <div className="card-list">
          {highlightAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={`asset-row ${selectedAssetId === asset.id ? 'active' : ''}`}
              onClick={() => selectAsset(asset.id)}
              style={{ padding: '18px' }}
            >
              <div>
                <div className="asset-title">
                  <div>
                    <strong>{asset.symbol}</strong>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>{asset.name}</div>
                  </div>
                </div>
                <div className="asset-meta">
                  <span>{asset.sourceLabel}</span>
                  <span>{asset.confidence ? `Confidence ${asset.confidence}%` : 'Tin cậy chưa rõ'}</span>
                </div>
              </div>
              <div className="asset-value">
                <div className={asset.priceChange24h >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(asset.priceChange24h)}</div>
                <div className="badge">{signalLabel(asset.score)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Tìm mã và thêm vào watchlist</span>
          <span>Nhập mã để theo dõi</span>
        </div>
        <div className="input-group" style={{ gridTemplateColumns: '1fr auto auto', display: 'grid', gap: 12, alignItems: 'end' }}>
          <input
            value={manualSymbol}
            onChange={(e) => setManualSymbol(e.target.value)}
            placeholder="Nhập mã (VD: SSI, VCB, BTC)"
          />
          <button type="button" className="primary" onClick={handleSymbolSearch}>Tìm mã</button>
          <button type="button" className="secondary-button" onClick={handleAddWatchlist} disabled={!searchedAsset}>Theo dõi</button>
        </div>
        {searchMessage && <div className="muted-text" style={{ marginTop: 12 }}>{searchMessage}</div>}
        {searchedAsset && (
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            <div className="asset-meta" style={{ gap: 10 }}>
              <span>{searchedAsset.symbol} — {searchedAsset.name}</span>
              <span>{searchedAsset.sourceLabel}</span>
              <span>{searchedAsset.confidence ? `Confidence ${searchedAsset.confidence}%` : 'Độ tin cậy chưa xác thực'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="primary" onClick={() => { selectAsset(searchedAsset.id); setActiveTab('analysis'); }}>
                Xem phân tích
              </button>
              <button type="button" className="secondary-button" onClick={() => { selectAsset(searchedAsset.id); setActiveTab('calc'); }}>
                Nhập vị thế
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">
          <span>Watchlist của bạn</span>
          <span>Quản lý mã theo dõi</span>
        </div>
        <div className="card-list">
          {watchlistSymbols.length > 0 ? (
            watchlistSymbols.map((symbol) => {
              const watchAsset = radarAssets.find((asset) => asset.symbol.toUpperCase() === symbol || asset.id.toUpperCase() === symbol);
              return (
                <div key={symbol} className="asset-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{symbol}</strong>
                    <div className="muted-text" style={{ fontSize: 12 }}>
                      {watchAsset ? `${watchAsset.type === 'crypto' ? 'Crypto' : 'VN Stock'} • ${watchAsset.sourceLabel}` : 'Chưa có dữ liệu kèm theo'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {watchAsset && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          selectAsset(watchAsset.id);
                          setActiveTab('analysis');
                        }}
                      >
                        Phân tích
                      </button>
                    )}
                    <button type="button" className="secondary-button" onClick={() => removeWatchlistSymbol(symbol)}>Xóa</button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="muted-text">Chưa có mã watchlist. Thêm mã bằng cách nhập ở trên.</div>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ gap: 18 }}>
        <AssetTable title="Kèo Crypto" assets={cryptoAssets} />
        <AssetTable title="Kèo Chứng khoán Việt" assets={vnAssets} />
      </div>

      <div className="card">
        <div className="card-title">
          <span>Danh sách mở rộng</span>
          <span>Chọn để xem phân tích</span>
        </div>
        <div className="card-list">
          {radarAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={`asset-row ${selectedAssetId === asset.id ? 'active' : ''}`}
              onClick={() => selectAsset(asset.id)}
            >
              <div>
                <div className="asset-title">
                  <strong>{asset.symbol}</strong>
                </div>
                <div className="asset-meta">
                  <span>{asset.type === 'crypto' ? 'Crypto' : 'VN Stock'}</span>
                  <span>{asset.sourceLabel}</span>
                </div>
              </div>
              <div className="asset-value">
                <div className={asset.priceChange24h >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(asset.priceChange24h)}</div>
                <div className="badge">{asset.score}</div>
              </div>
            </button>
          ))}
          {radarAssets.length === 0 && <div style={{ color: '#8892b0' }}>Không tìm thấy dữ liệu.</div>}
        </div>
      </div>
    </section>
  );
}
