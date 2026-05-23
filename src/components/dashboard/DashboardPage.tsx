import { useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { AssetSummary } from '../../types';
import { fetchLiveAssetSummary } from '../../data/api';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const categoryDefinitions = [
  { id: 'gold', label: 'Kèo Vàng' },
  { id: 'crypto', label: 'Crypto (Binance)' },
  { id: 'vn', label: 'Chứng khoán VN' },
  { id: 'accumulate', label: 'Đang tích lũy' },
  { id: 'super', label: 'Kèo Siêu Bùng Nổ' },
  { id: 'reverse', label: 'Kèo Nghịch Đảo' },
] as const;

type CategoryId = typeof categoryDefinitions[number]['id'];

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
  const [activeCategory, setActiveCategory] = useState<CategoryId>('gold');

  const inferType = (symbol: string) => {
    const normalized = symbol.trim().toUpperCase();
    if (
      normalized.endsWith('USDT') ||
      normalized.endsWith('BTC') ||
      normalized.endsWith('ETH') ||
      normalized.endsWith('BNB') ||
      normalized.endsWith('SOL') ||
      normalized.endsWith('XRP') ||
      normalized.endsWith('ADA') ||
      normalized.endsWith('DOGE')
    ) {
      return 'crypto' as const;
    }
    if (normalized.length <= 5 && /^[A-Z]{2,5}$/.test(normalized)) {
      return 'vn-stock' as const;
    }
    return 'crypto' as const;
  };

  const normalizedSymbol = manualSymbol.trim().toUpperCase();
  const matchedAsset = useMemo(
    () =>
      radarAssets.find(
        (asset) => asset.symbol.toUpperCase() === normalizedSymbol || asset.id.toUpperCase() === normalizedSymbol,
      ),
    [normalizedSymbol, radarAssets],
  );

  const filteredGroups = useMemo(() => {
    const gold = radarAssets.filter((asset) => (asset.score ?? 0) >= 70);
    const crypto = radarAssets.filter((asset) => asset.type === 'crypto');
    const vn = radarAssets.filter((asset) => asset.type === 'vn-stock');
    const accumulation = radarAssets.filter((asset) => {
      const change = Math.abs(asset.priceChange24h ?? 0);
      return change <= 1.8 && (asset.score ?? 0) < 70;
    });
    const superBoom = radarAssets.filter(
      (asset) => (asset.priceChange24h ?? 0) >= 5 || (asset.score ?? 0) >= 85,
    );
    const reverse = radarAssets.filter((asset) => (asset.priceChange24h ?? 0) < 0);

    return {
      gold,
      crypto,
      vn,
      accumulate: accumulation,
      super: superBoom,
      reverse,
    } as const;
  }, [radarAssets]);

  const activeAssets = filteredGroups[activeCategory].slice(0, 6);

  const categoryButtons = categoryDefinitions.map((category) => {
    const count = filteredGroups[category.id].length;
    return {
      ...category,
      label:
        category.id === 'gold' || category.id === 'super' || category.id === 'reverse'
          ? `${category.label} (${count})`
          : category.label,
    };
  });

  const handleSymbolSearch = async () => {
    const symbol = normalizedSymbol;
    setSearchMessage('');
    setSearchedAsset(null);
    if (!symbol) {
      setSearchMessage('Vui lòng nhập mã để tìm kiếm.');
      return;
    }
    if (matchedAsset) {
      setSearchedAsset(matchedAsset);
      selectAsset(matchedAsset.id);
      setActiveTab('analysis');
      setSearchMessage(`Tìm thấy ${matchedAsset.symbol}. Chuyển sang phân tích.`);
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
      setSearchMessage(`Loaded giá realtime cho ${symbol} từ ${liveData.sourceLabel}.`);
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
        sourceDetails: ['Không có giá realtime. Dữ liệu tham khảo.', `Type: ${inferredType}`],
        confidence: 25,
        raw: { manual: true },
        hasLivePrice: false,
        score: 10,
      };
      addCustomAsset(customAsset);
      setSearchedAsset(customAsset);
      selectAsset(customAsset.id);
      setActiveTab('analysis');
      setSearchMessage(`Không tải được giá realtime cho ${symbol}. Dùng dữ liệu tham khảo.`);
    }
  };

  const handleAddWatchlist = () => {
    if (!searchedAsset) {
      setSearchMessage('Tìm mã trước khi thêm vào watchlist.');
      return;
    }
    addWatchlistSymbol(searchedAsset.symbol);
    setSearchMessage(`Đã thêm ${searchedAsset.symbol} vào watchlist.`);
  };

  const watchlistAssets = radarAssets.filter((asset) =>
    watchlistSymbols.includes(asset.symbol.toUpperCase()),
  );

  return (
    <section className="page-section dashboard-page">
      <div className="dashboard-summary-grid">
        <article className="dashboard-summary-card">
          <div className="card-title">
            <span>Top Picks</span>
            <span className="badge">{activeAssets.length} kèo</span>
          </div>
          <p className="section-subtitle">
            Hiển thị kèo đầu bảng theo bộ lọc hiện tại, giúp bạn hành động nhanh hơn.
          </p>
        </article>
        <article className="dashboard-summary-card">
          <div className="card-title">
            <span>Luồng hành động</span>
            <span className="badge">Tập trung</span>
          </div>
          <p className="section-subtitle">
            Chọn kèo, mở phân tích, hoặc thêm ngay vào watchlist để không bỏ lỡ cơ hội.
          </p>
        </article>
      </div>

      <div className="dashboard-actions-row">
        <div className="category-row">
          {categoryButtons.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-pill ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="quick-stat-card">
          <div>
            <strong>{radarAssets.length}</strong>
            <p>Toàn bộ mã quét</p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => activeAssets[0] && refreshAssetPrice(activeAssets[0].symbol)}
            disabled={activeAssets.length === 0}
          >
            Làm mới giá
          </button>
        </div>
      </div>

      <div className="signal-card-grid">
        {activeAssets.map((asset) => {
          const price = asset.currentPrice ?? 0;
          const change = asset.priceChange24h ?? 0;
          const signalLabel = asset.score >= 70 ? 'KÈO VÀNG' : 'WATCH';
          const scoreDisplay = asset.score ?? 0;
          const isWatched = watchlistSymbols.includes(asset.symbol.toUpperCase());

          return (
            <article key={asset.id} className="asset-card">
              <div className="asset-card-header">
                <div>
                  <div className="asset-title-row">
                    <strong>{asset.symbol}</strong>
                    <span className="asset-type">{asset.type === 'crypto' ? 'CRYPTO' : 'STOCK'}</span>
                  </div>
                  <div className="asset-tagline">
                    {asset.type === 'crypto' ? 'SUPER-PUMP HUNTER' : 'DIVIDEND STRIKE'}
                  </div>
                </div>
                <span className={`asset-card-tag ${signalLabel === 'KÈO VÀNG' ? 'asset-card-tag-gold' : ''}`}>
                  {signalLabel}
                </span>
              </div>

              <div className="asset-price-row">
                <span className="asset-price">{formatCurrency(price, asset.type === 'crypto' ? 'USD' : 'VND')}</span>
                <span className={change >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(change)}</span>
              </div>

              <div className="score-row">
                <div className="score-circle">{scoreDisplay}</div>
                <div className="metric-row">
                  <div className="metric-block">
                    <span>Tăng</span>
                    <strong>{Math.max(0, Math.round(change * 1.2))}</strong>
                  </div>
                  <div className="metric-block">
                    <span>Tiền</span>
                    <strong>{Math.max(1, Math.min(10, Math.round((asset.score ?? 0) / 10)))}</strong>
                  </div>
                </div>
              </div>

              <div className="tag-row">
                <span className="tag-chip">RANGE</span>
                <span className="tag-chip">FVG</span>
                <span className="tag-chip">RSI 60</span>
              </div>

              <div className="notice-line">
                <strong>MrTung Brain</strong> · Mã {asset.symbol} đạt {Math.min(10, Math.round(scoreDisplay / 10))}/10 điểm DNA.
              </div>

              <div className="action-row">
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
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    selectAsset(asset.id);
                    setActiveTab('calc');
                  }}
                >
                  🧮
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    if (isWatched) {
                      removeWatchlistSymbol(asset.symbol);
                    } else {
                      addWatchlistSymbol(asset.symbol);
                    }
                  }}
                >
                  {isWatched ? 'Đã theo dõi' : '🔔'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid-2 dashboard-bottom-grid">
        <article className="card watchlist-panel">
          <div className="card-title">
            <span>Watchlist</span>
            <span className="badge">{watchlistSymbols.length} mã</span>
          </div>
          <div className="card-list">
            {watchlistAssets.length === 0 ? (
              <div className="empty-state">
                Chưa có mã nào trong watchlist. Thêm mã từ kèo hoặc tìm nhanh phía bên phải.
              </div>
            ) : (
              watchlistAssets.slice(0, 6).map((asset) => {
                const change = asset.priceChange24h ?? 0;
                const priceDisplay = formatCurrency(asset.currentPrice ?? 0, asset.type === 'crypto' ? 'USD' : 'VND');
                return (
                  <button
                    key={asset.id}
                    type="button"
                    className="asset-row"
                    onClick={() => {
                      selectAsset(asset.id);
                      setActiveTab('analysis');
                    }}
                  >
                    <div className="asset-title">
                      <strong>{asset.symbol}</strong>
                      <span className="asset-meta">{asset.name || asset.symbol}</span>
                    </div>
                    <div className="asset-value">
                      <strong>{formatPercent(change)}</strong>
                      <span className={change >= 0 ? 'text-success' : 'text-danger'}>{priceDisplay}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </article>

        <article className="card search-panel">
          <div className="card-title">
            <span>Tìm mã & phân tích</span>
            <span className="badge">Nhập nhanh</span>
          </div>
          <div className="input-group">
            <input
              value={manualSymbol}
              onChange={(e) => setManualSymbol(e.target.value)}
              placeholder="Nhập mã, ví dụ: SSI, VCB, BTC"
            />
            <div className="search-buttons">
              <button type="button" className="primary" onClick={handleSymbolSearch}>
                Search
              </button>
              <button type="button" className="secondary-button" onClick={handleAddWatchlist} disabled={!searchedAsset}>
                Watch
              </button>
            </div>
          </div>
          {searchedAsset && (
            <div className="search-result-card">
              <strong>{searchedAsset.symbol}</strong>
              <div>{searchedAsset.sourceLabel}</div>
            </div>
          )}
          {searchMessage && <div className="muted-text search-note">{searchMessage}</div>}
        </article>
      </div>
    </section>
  );
}
