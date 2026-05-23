import { proxyFetch } from '../utils/proxyFetch';
import { AssetSummary } from '../types';

const COINGECKO_MARKETS =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=14&page=1&sparkline=true&price_change_percentage=24h%2C7d';
const TCBS_ENDPOINT = 'https://apipubcks.tcbs.com.vn/api/v1/ticker/';

function calculateScore(asset: AssetSummary) {
  let score = 30;
  score += Math.min(15, Math.max(-15, asset.priceChange24h));
  score += Math.min(10, Math.max(-10, asset.priceChange7d ?? 0) / 2);
  if (asset.marketCap) {
    const capScore = Math.min(15, Math.log10(asset.marketCap + 1) - 6) * 2;
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
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function fetchCryptoRadar(): Promise<AssetSummary[]> {
  const response = await fetch(COINGECKO_MARKETS);
  if (!response.ok) {
    throw new Error('Không thể lấy dữ liệu crypto từ CoinGecko');
  }
  const data = await response.json();
  return data.map((item: any) => {
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
      raw: item,
      score: 0,
    };
    return { ...asset, score: calculateScore(asset) };
  });
}

export async function fetchVnStockRadar(symbols: string[]): Promise<AssetSummary[]> {
  const results: AssetSummary[] = [];
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const response = await proxyFetch(`${TCBS_ENDPOINT}${symbol}`);
        const item = await response.json();
        if (!item || typeof item !== 'object') {
          return;
        }
        const currentPrice = Number(item.price) || Number(item.close) || 0;
        const delta = Number(item.change) || 0;
        const asset: AssetSummary = {
          id: symbol,
          symbol,
          name: item.name || symbol,
          type: 'vn-stock',
          currentPrice,
          priceChange24h: delta,
          priceHigh24h: item.high ? Number(item.high) : undefined,
          priceLow24h: item.low ? Number(item.low) : undefined,
          marketCap: item.marketcap ? Number(item.marketcap) : undefined,
          volume24h: item.volume ? Number(item.volume) : undefined,
          lastUpdated: new Date().toISOString(),
          sourceLabel: 'TCBS',
          raw: item,
          score: 0,
        };
        results.push({ ...asset, score: calculateScore(asset) });
      } catch (error) {
        console.warn('Fetch VN stock failed', symbol, error);
      }
    }),
  );
  return results;
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
