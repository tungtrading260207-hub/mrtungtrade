import { useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { AssetSummary } from '../../types';
import { fetchLiveAssetSummary } from '../../data/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const categoryTags = [
  'Kèo Vàng (8)',
  'Crypto (Binance)',
  'Chứng khoán VN',
  'Đang tích lũy (15)',
  'Kèo Siêu Bùng Nổ',
  'Kèo Nghịch Đảo (0)',
];

export default function DashboardPage() {
  const radarAssets = useAppStore((state) => state.radarAssets);
  const selectAsset = useAppStore((state) => state.selectAsset);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const addCustomAsset = useAppStore((state) => state.addCustomAsset);
  const watchlistSymbols = useAppStore((state) => state.watchlistSymbols);
  const addWatchlistSymbol = useAppStore((state) => state.addWatchlistSymbol);
  const removeWatchlistSymbol = useAppStore((state) => state.removeWatchlistSymbol);
  const refreshAssetPrice = useAppStore((state) => state.refreshAssetPrice);

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

  const topAssets = useMemo(
    () => radarAssets
      .slice()
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 6),
    [radarAssets],
  );

  const handleSymbolSearch = async () => {
    const symbol = normalizedSymbol;
    setSearchMessage('');
    setSearchedAsset(null);
    if (!symbol) {
      setSearchMessage('Please enter a symbol to search.');
      return;
    }
    if (matchedAsset) {
      setSearchedAsset(matchedAsset);
      selectAsset(matchedAsset.id);
      setActiveTab('analysis');
      setSearchMessage(`Found ${matchedAsset.symbol}. Redirecting to analysis.`);
      return;
    }

    const inferredType = inferType(symbol);
    try {
      const liveData = await fetchLiveAssetSummary(symbol, inferredType);
      const customAsset: AssetSummary = {
        id: symbol,
        symbol,
        name: symbol,
        type: inferredType,
        currentPrice: liveData.currentPrice,
        priceChange24h: liveData.priceChange24h,
        priceHigh24h: liveData.priceHigh24h,
        priceLow24h: liveData.priceLow24h,
        marketCap: liveData.marketCap,
        volume24h: liveData.volume24h,
        lastUpdated: new Date().toISOString(),
        sourceLabel: liveData.sourceLabel,
        sourceDetails: liveData.sourceDetails,
        confidence: liveData.confidence,
        raw: { manual: true },
        hasLivePrice: true,
        score: 0,
      };
      addCustomAsset({ ...customAsset, score: 0 });
      setSearchedAsset(customAsset);
      selectAsset(customAsset.id);
      setActiveTab('analysis');
      setSearchMessage(`Realtime price loaded for ${symbol} from ${liveData.sourceLabel}.`);
      return;
    } catch (error: any) {
      const customAsset: AssetSummary = {
        id: symbol,
        symbol,
        name: symbol,
        type: inferredType,
        currentPrice: 0,
        priceChange24h: 0,
        lastUpdated: new Date().toISOString(),
        sourceLabel: 'Manual Input',
        sourceDetails: ['No realtime price available. Data is for reference only.', `Type: ${inferredType}`],
        confidence: 25,
        raw: { manual: true },
        hasLivePrice: false,
        score: 10,
      };
      addCustomAsset(customAsset);
      setSearchedAsset(customAsset);
      selectAsset(customAsset.id);
      setActiveTab('analysis');
      setSearchMessage(`Could not load realtime price for ${symbol}. Reference-only data is available.`);
    }
  };

  const handleAddWatchlist = () => {
    if (!searchedAsset) {
      setSearchMessage('Please search a symbol before adding to watchlist.');
      return;
    }
    addWatchlistSymbol(searchedAsset.symbol);
    setSearchMessage(`Added ${searchedAsset.symbol} to watchlist.`);
  };

  return (
    <section className="page-section">
      <div className="dashboard-summary-card card">
        <div>
          <div className="card-title">
            <span>Dividend Strategy · Gap Fill</span>
            <span className="badge">Hiện 5 mã</span>
          </div>
          <p className="section-subtitle">Chiến thuật săn cổ tức & tối ưu vòng quay vốn qua lịch sử lấp Gap.</p>
        </div>
        <div className="dashboard-summary-actions">
          <button type="button" className="primary" onClick={() => setActiveTab('radar')}>
            Quét lại ngay
          </button>
        </div>
      </div>

      <div className="dashboard-category-row">
        {categoryTags.map((label) => (
          <button key={label} type="button" className="secondary-button">
            {label}
          </button>
        ))}
      </div>

      <div className="signal-card-grid">
        {topAssets.map((asset) => {
          const performance = asset.priceChange24h ?? 0;
          const power = Math.max(0, Math.min(10, Math.round((asset.score ?? 0) / 10)));
          const gainValue = asset.priceChange24h ? Math.round(asset.priceChange24h * 1.2) : 0;
          const trend = asset.score >= 70 ? 'KÈO VÀNG' : 'TÍN HIỆU';
          return (
            <article key={asset.id} className="signal-card">
              <div className="signal-card-header">
                <span className="signal-card-label">{asset.type === 'crypto' ? 'CRYPTO' : 'STOCK'}</span>
                <span className="signal-pill">{trend}</span>
              </div>
              <div className="signal-card-title">{asset.symbol}</div>
              <div className="signal-card-subtitle">DIVIDEND STRIKE</div>
              <div className="signal-card-price">
                <strong>{formatCurrency(asset.currentPrice ?? 0, asset.type === 'crypto' ? 'USD' : 'VND')}</strong>
                <span className={performance >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(performance)}</span>
              </div>
              <div className="signal-score-row">
                <div className="signal-score-circle">{asset.score ?? 0}</div>
                <div className="signal-card-meta">
                  <span>Tăng {gainValue}</span>
                  <span>Tiền {power}</span>
                  <span>TS {Math.min(10, power)}</span>
                </div>
              </div>
              <div className="signal-card-footer">
                <div className="metric-pill">RANGE</div>
                <div className="metric-pill">FVG</div>
                <div className="metric-pill">RSI 60</div>
                <div className="metric-pill">W3</div>
                <div className="metric-pill">VWAP</div>
              </div>
              <div className="signal-card-notice">
                <strong>MrTung Brain</strong> · Mã {asset.symbol} đạt {Math.min(10, Math.round((asset.score ?? 0) / 10))}/10 điểm DNA.
              </div>
              <div className="signal-card-actions">
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    selectAsset(asset.id);
                    setActiveTab('analysis');
                  }}
                >
                  Phân tích
                </button>
                <button type="button" className="secondary-button">🔔</button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title">
          <span>Your watchlist</span>
          <span>Manage tracked symbols</span>
        </div>
        <div className="card-list">
          {watchlistSymbols.length > 0 ? (
            watchlistSymbols.map((symbol) => {
              const watchAsset = radarAssets.find((asset) => asset.symbol.toUpperCase() === symbol || asset.id.toUpperCase() === symbol);
              return (
                <div key={symbol} className="asset-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{symbol}</strong>
                    <div className="asset-meta" style={{ gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>
                        {watchAsset ? (watchAsset.type === 'crypto' ? 'Crypto' : 'VN Stock') : 'No additional data'}
                      </span>
                      {watchAsset && (
                        <span className={`confidence-badge ${watchAsset.confidence && watchAsset.confidence >= 70 ? 'gold' : ''}`} data-tooltip={watchAsset.sourceDetails?.join(' | ')}>
                          {watchAsset.confidence ? `${watchAsset.confidence}%` : 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {watchAsset && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          selectAsset(watchAsset.id);
                          setActiveTab('analysis');
                        }}
                      >
                        Analyze
                      </button>
                    )}
                    <button type="button" className="secondary-button" onClick={() => removeWatchlistSymbol(symbol)}>Remove</button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="muted-text">No watchlist symbols yet. Add one above.</div>
          )}
        </div>
      </div>
    </section>
  );
}
