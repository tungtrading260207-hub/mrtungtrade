import { useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { AssetSummary } from '../../types';
import { fetchLiveAssetSummary } from '../../data/api';

export default function DashboardPage() {
  const radarAssets = useAppStore((state) => state.radarAssets);
  const selectAsset = useAppStore((state) => state.selectAsset);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const addCustomAsset = useAppStore((state) => state.addCustomAsset);
  const watchlistSymbols = useAppStore((state) => state.watchlistSymbols);
  const addWatchlistSymbol = useAppStore((state) => state.addWatchlistSymbol);
  const removeWatchlistSymbol = useAppStore((state) => state.removeWatchlistSymbol);
  const refreshAssetPrice = useAppStore((state) => state.refreshAssetPrice);
  const news = useAppStore((state) => state.news);

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
      <div className="card">
        <div className="card-title">
          <span>Quick navigation</span>
          <span className="badge">Compact dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="primary" onClick={() => setActiveTab('radar')}>
            View Radar picks
          </button>
          <button type="button" className="secondary-button" onClick={() => setActiveTab('news')}>
            Market news
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>Search symbol</span>
          <span>Add to watchlist</span>
        </div>
        <div className="input-group" style={{ gridTemplateColumns: '1fr auto auto', display: 'grid', gap: 12, alignItems: 'end' }}>
          <input
            value={manualSymbol}
            onChange={(e) => setManualSymbol(e.target.value)}
            placeholder="Type symbol, e.g. SSI, VCB, BTC"
          />
          <button type="button" className="primary" onClick={handleSymbolSearch}>Search</button>
          <button type="button" className="secondary-button" onClick={handleAddWatchlist} disabled={!searchedAsset}>Watch</button>
        </div>
        {searchMessage && <div className="muted-text" style={{ marginTop: 12 }}>{searchMessage}</div>}
        {searchedAsset && (
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            <div className="asset-meta" style={{ gap: 10 }}>
              <span>{searchedAsset.symbol} — {searchedAsset.name}</span>
              <span>{searchedAsset.sourceLabel}</span>
              <span className={`confidence-badge ${searchedAsset.confidence && searchedAsset.confidence >= 70 ? 'gold' : ''}`} data-tooltip={searchedAsset.sourceDetails?.join(' | ')}>
                {searchedAsset.confidence ? `${searchedAsset.confidence}%` : 'N/A'}
              </span>
            </div>
            {!searchedAsset.hasLivePrice && (
              <div className="card" style={{ padding: '12px 14px', background: 'rgba(231, 76, 60, 0.08)', border: '1px solid rgba(231, 76, 60, 0.22)' }}>
                <strong style={{ color: '#e55d4a' }}>Note:</strong> No realtime price available. Reference-only analysis, verify price before trading.
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="primary" onClick={() => { selectAsset(searchedAsset.id); setActiveTab('analysis'); }}>
                Go to analysis
              </button>
              <button type="button" className="secondary-button" onClick={() => { selectAsset(searchedAsset.id); setActiveTab('calc'); }}>
                Position input
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={async () => {
                  setSearchMessage('Refreshing price...');
                  const ok = await refreshAssetPrice(searchedAsset.id);
                  setSearchMessage(ok ? `Updated price for ${searchedAsset.symbol}` : `Cannot refresh price for ${searchedAsset.symbol}`);
                }}
              >
                Refresh price
              </button>
            </div>
          </div>
        )}
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

      <div className="card">
        <div className="card-title">
          <span>Market news</span>
          <span className="badge">RSS and headlines</span>
        </div>
        <div className="card-list" style={{ gap: 10, maxHeight: 320, overflow: 'auto' }}>
          {news.length > 0 ? (
            news.slice(0, 8).map((item) => (
              <a key={item.link} href={item.link} target="_blank" rel="noreferrer" className="news-link">
                <div style={{ display: 'grid', gap: 6 }}>
                  <strong style={{ fontSize: 14 }}>{item.title}</strong>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{item.pubDate}</span>
                </div>
              </a>
            ))
          ) : (
            <div className="muted-text">Loading news... refresh if no content appears.</div>
          )}
        </div>
      </div>
    </section>
  );
}
