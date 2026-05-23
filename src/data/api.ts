import { proxyFetch } from '../utils/proxyFetch';
import { AssetSummary, MarketType } from '../types';

const COINGECKO_MARKETS =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=14&page=1&sparkline=true&price_change_percentage=24h%2C7d';
const TCBS_ENDPOINT = 'https://apipubcks.tcbs.com.vn/api/v1/ticker/';
const VNDIRECT_QUOTE = 'https://finfo-api.vndirect.com.vn/v4/stock/quote?symbol=';

async function fetchJsonWithFallback(url: string, init?: RequestInit) {
  try {
    const response = await fetch(url, init);
    if (response.ok) return response;
  } catch {
    // ignore and try proxy fallback
  }
  return proxyFetch(url, init);
}

async function fetchBinanceTicker(symbol: string) {
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
  const response = await fetchJsonWithFallback(url);
  if (!response.ok) {
    throw new Error('Binance fetch failed');
  }
  return response.json();
}

function buildConfidence(deviation: number, availableSources: number) {
  if (availableSources >= 2) {
    return Math.max(35, Math.round(100 - Math.min(65, deviation * 4)));
  }
  return 55;
}

function calculateScore(asset: AssetSummary) {
  let score = 30;
  score += Math.min(15, Math.max(-15, asset.priceChange24h));
  score += Math.min(10, Math.max(-10, asset.priceChange7d ?? 0) / 2);
  if (asset.marketCap) {
    const capScore = Math.min(15, Math.max(0, Math.log10(asset.marketCap + 1) - 6) * 2);
    score += capScore;
  }
  if (asset.volume24h) {
    score += Math.min(15, asset.volume24h / 5_000_000);
  }
  if (asset.priceHigh24h && asset.priceLow24h) {
    score += Math.min(10, ((asset.currentPrice - asset.priceLow24h) / (asset.priceHigh24h - asset.priceLow24h || 1)) * 10);
  }
  if (asset.marketCapRank) {
    score += Math.max(0, 10 - asset.marketCapRank / 10);
  }
  if (asset.confidence !== undefined) {
    score += Math.min(10, asset.confidence / 10);
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeVnDirectItem(item: any) {
  if (!item) return null;
  const row = Array.isArray(item.data) ? item.data[0] : item.data || item;
  if (!row) return null;
  return {
    currentPrice: Number(row.closePrice ?? row.close ?? row.price ?? 0),
    change: Number(row.priceChange ?? row.chg ?? row.change ?? 0),
    marketCap: Number(row.marketCapital ?? row.marketCap ?? 0),
    volume24h: Number(row.totalTradingVolume ?? row.totalVolume ?? 0),
    high: Number(row.high ?? row.maxPrice ?? 0) || undefined,
    low: Number(row.low ?? row.minPrice ?? 0) || undefined,
  };
}

export async function fetchCryptoRadar(): Promise<AssetSummary[]> {
  const response = await fetchJsonWithFallback(COINGECKO_MARKETS);
  if (!response.ok) {
    throw new Error('Không thể lấy dữ liệu crypto từ CoinGecko');
  }
  const data = await response.json();
  const assets = await Promise.all(
    data.map(async (item: any) => {
      const asset: AssetSummary = {
        id: item.id,
        symbol: item.symbol.toUpperCase(),
        name: item.name,
        type: 'crypto',
        currentPrice: item.current_price,
        priceChange24h: item.price_change_percentage_24h_in_currency ?? 0,
        priceChange7d: item.price_change_percentage_7d_in_currency ?? 0,
        priceHigh24h: item.high_24h,
        priceLow24h: item.low_24h,
        circulatingSupply: item.circulating_supply,
        totalSupply: item.total_supply,
        marketCap: item.market_cap,
        marketCapRank: item.market_cap_rank,
        volume24h: item.total_volume,
        marketCapChange24h: item.market_cap_change_percentage_24h,
        sparkline7d: item.sparkline_in_7d?.price,
        lastUpdated: item.last_updated,
        sourceLabel: 'CoinGecko',
        sourceDetails: ['CoinGecko'],
        confidence: 55,
        raw: item,
        score: 0,
      };

      try {
        const binanceSymbol = `${asset.symbol}USDT`;
        const binanceData = await fetchBinanceTicker(binanceSymbol);
        const binancePrice = Number(binanceData.lastPrice ?? binanceData.prevClosePrice ?? binanceData.openPrice ?? 0);
        const deviation = Math.abs(asset.currentPrice - binancePrice) / Math.max(1, asset.currentPrice) * 100;
        asset.sourceDetails = [`CoinGecko: ${asset.currentPrice}`, `Binance: ${binancePrice}`];
        asset.confidence = buildConfidence(deviation, 2);
        asset.sourceLabel = 'CoinGecko + Binance';
      } catch (error: any) {
        asset.sourceDetails?.push(`Binance unavailable: ${error?.message ?? 'error'}`);
        asset.confidence = 45;
      }

      return { ...asset, score: calculateScore(asset) };
    }),
  );
  return assets.sort((a, b) => b.score - a.score);
}

async function fetchTcbsQuote(symbol: string) {
  const response = await proxyFetch(`${TCBS_ENDPOINT}${symbol}`);
  const item = await response.json();
  if (!item || typeof item !== 'object') {
    throw new Error('TCBS trả dữ liệu không hợp lệ');
  }
  return {
    currentPrice: Number(item.price) || Number(item.close) || 0,
    change: Number(item.change) || 0,
    high: item.high ? Number(item.high) : undefined,
    low: item.low ? Number(item.low) : undefined,
    marketCap: item.marketcap ? Number(item.marketcap) : undefined,
    volume24h: item.volume ? Number(item.volume) : undefined,
    raw: item,
  };
}

async function fetchVnDirectQuote(symbol: string) {
  const response = await fetchJsonWithFallback(`${VNDIRECT_QUOTE}${symbol}`);
  if (!response.ok) {
    throw new Error('VNDIRECT fetch failed');
  }
  const item = await response.json();
  const data = normalizeVnDirectItem(item);
  if (!data || !data.currentPrice) {
    throw new Error('VNDIRECT dữ liệu không hợp lệ');
  }
  return data;
}

export async function fetchVnStockRadar(symbols: string[]): Promise<AssetSummary[]> {
  const results: AssetSummary[] = [];

  await Promise.all(
    symbols.map(async (symbol) => {
      const sourceDetails: string[] = [];
      let tcbsData: any = null;
      let vndirectData: any = null;
      let confidence = 50;
      let priceHigh24h: number | undefined;
      let priceLow24h: number | undefined;
      let marketCap: number | undefined;
      let volume24h: number | undefined;

      try {
        tcbsData = await fetchTcbsQuote(symbol);
        sourceDetails.push(`TCBS: ${tcbsData.currentPrice}`);
      } catch (error: any) {
        sourceDetails.push(`TCBS error: ${error?.message ?? 'unknown'}`);
      }

      try {
        vndirectData = await fetchVnDirectQuote(symbol);
        sourceDetails.push(`VNDIRECT: ${vndirectData.currentPrice}`);
      } catch (error: any) {
        sourceDetails.push(`VNDIRECT error: ${error?.message ?? 'unknown'}`);
      }

      const currentPrice = tcbsData?.currentPrice || vndirectData?.currentPrice || 0;
      const delta = tcbsData?.change ?? vndirectData?.change ?? 0;
      priceHigh24h = tcbsData?.high ?? vndirectData?.high;
      priceLow24h = tcbsData?.low ?? vndirectData?.low;
      marketCap = tcbsData?.marketCap ?? vndirectData?.marketCap;
      volume24h = tcbsData?.volume24h ?? vndirectData?.volume24h;

      if (tcbsData && vndirectData) {
        const deviation = Math.abs(tcbsData.currentPrice - vndirectData.currentPrice) / Math.max(1, (tcbsData.currentPrice + vndirectData.currentPrice) / 2) * 100;
        confidence = buildConfidence(deviation, 2);
      } else if (tcbsData || vndirectData) {
        confidence = 60;
      } else {
        confidence = 30;
      }

      const asset: AssetSummary = {
        id: symbol,
        symbol,
        name: symbol,
        type: 'vn-stock',
        currentPrice,
        priceChange24h: delta,
        priceHigh24h,
        priceLow24h,
        marketCap,
        volume24h,
        lastUpdated: new Date().toISOString(),
        sourceLabel: sourceDetails.join(' | '),
        sourceDetails,
        confidence,
        raw: { tcbs: tcbsData?.raw, vndirect: vndirectData },
        score: 0,
      };

      results.push({ ...asset, score: calculateScore(asset) });
    }),
  );

  return results.sort((a, b) => b.score - a.score);
}

export async function fetchLiveAssetSummary(symbol: string, type: MarketType) {
  const normalized = symbol.trim().toUpperCase();
  const sourceDetails: string[] = [];
  let currentPrice = 0;
  let delta = 0;
  let high: number | undefined;
  let low: number | undefined;
  let marketCap: number | undefined;
  let volume24h: number | undefined;
  let sourceLabel = 'Manual Input';
  let confidence = 30;

  if (type === 'crypto') {
    const baseSymbol = normalized.endsWith('USDT') ? normalized.replace(/USDT$/, '') : normalized;
    try {
      const binanceData = await fetchBinanceTicker(`${baseSymbol}USDT`);
      currentPrice = Number(binanceData.lastPrice ?? binanceData.prevClosePrice ?? binanceData.openPrice ?? 0);
      delta = Number(binanceData.priceChangePercent ?? binanceData.priceChangePercent ?? 0);
      high = Number(binanceData.highPrice ?? 0) || undefined;
      low = Number(binanceData.lowPrice ?? 0) || undefined;
      volume24h = Number(binanceData.quoteVolume ?? binanceData.volume ?? 0) || undefined;
      sourceDetails.push(`Binance: ${currentPrice}`);
      sourceLabel = 'Binance';
      confidence = 70;
    } catch (error: any) {
      sourceDetails.push(`Binance unavailable: ${error?.message ?? 'error'}`);
      throw new Error('Không lấy được giá crypto từ Binance');
    }
  } else {
    let tcbsData: any = null;
    let vndirectData: any = null;
    try {
      tcbsData = await fetchTcbsQuote(normalized);
      sourceDetails.push(`TCBS: ${tcbsData.currentPrice}`);
    } catch (error: any) {
      sourceDetails.push(`TCBS error: ${error?.message ?? 'unknown'}`);
    }
    try {
      vndirectData = await fetchVnDirectQuote(normalized);
      sourceDetails.push(`VNDIRECT: ${vndirectData.currentPrice}`);
    } catch (error: any) {
      sourceDetails.push(`VNDIRECT error: ${error?.message ?? 'unknown'}`);
    }

    currentPrice = tcbsData?.currentPrice || vndirectData?.currentPrice || 0;
    delta = tcbsData?.change ?? vndirectData?.change ?? 0;
    high = tcbsData?.high ?? vndirectData?.high;
    low = tcbsData?.low ?? vndirectData?.low;
    marketCap = tcbsData?.marketCap ?? vndirectData?.marketCap;
    volume24h = tcbsData?.volume24h ?? vndirectData?.volume24h;

    if (tcbsData && vndirectData) {
      const deviation = Math.abs(tcbsData.currentPrice - vndirectData.currentPrice) / Math.max(1, (tcbsData.currentPrice + vndirectData.currentPrice) / 2) * 100;
      confidence = buildConfidence(deviation, 2);
      sourceLabel = 'TCBS + VNDIRECT';
    } else if (tcbsData || vndirectData) {
      confidence = 60;
      sourceLabel = tcbsData ? 'TCBS' : 'VNDIRECT';
    } else {
      confidence = 30;
      throw new Error('Không lấy được giá VN Stock từ TCBS/VNDIRECT');
    }
  }

  return {
    currentPrice,
    priceChange24h: delta,
    priceHigh24h: high,
    priceLow24h: low,
    marketCap,
    volume24h,
    sourceLabel,
    sourceDetails,
    confidence,
  };
}

async function fetchRss(url: string) {
  const response = await proxyFetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  return Array.from(doc.querySelectorAll('item')).map((item) => ({
    title: item.querySelector('title')?.textContent ?? '',
    link: item.querySelector('link')?.textContent ?? '',
    pubDate: item.querySelector('pubDate')?.textContent ?? '',
    description: item.querySelector('description')?.textContent ?? '',
  }));
}

export async function fetchNewsFeed() {
  const feeds = [
    'https://cafef.vn/thi-truong-chung-khoan.rss',
    'https://feeds.feedburner.com/CoinDesk',
    'https://vnexpress.net/rss/kinh-doanh',
  ];
  const articles = await Promise.all(feeds.map((feed) => fetchRss(feed).catch(() => [])));
  const merged = articles.flat().slice(0, 12);
  return merged.map((item) => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    description: item.description,
  }));
}
