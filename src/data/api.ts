import { proxyFetch } from '../utils/proxyFetch';
import { AssetSummary } from '../types';

const COINGECKO_MARKETS = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&price_change_percentage=24h';
const TCBS_ENDPOINT = 'https://apipubcks.tcbs.com.vn/api/v1/ticker/';

function calculateScore(asset: AssetSummary) {
  let score = 50;
  score += Math.min(20, Math.max(-20, asset.priceChange24h));
  if (asset.marketCap) {
    const capScore = Math.min(20, Math.log10(asset.marketCap + 1) - 6) * 3;
    score += capScore;
  }
  if (asset.volume24h) {
    score += Math.min(20, asset.volume24h / 1_000_000);
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
      priceChange24h: item.price_change_percentage_24h ?? 0,
      marketCap: item.market_cap,
      volume24h: item.total_volume,
      lastUpdated: item.last_updated,
      sourceLabel: 'CoinGecko',
      raw: item,
      score: calculateScore({
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        type: 'crypto',
        currentPrice: item.current_price,
        priceChange24h: item.price_change_percentage_24h ?? 0,
        marketCap: item.market_cap,
        volume24h: item.total_volume,
        lastUpdated: item.last_updated,
        sourceLabel: 'CoinGecko',
        score: 0,
      }),
    };
    return asset;
  });
}

export async function fetchVnStockRadar(symbols: string[]): Promise<AssetSummary[]> {
  const results: AssetSummary[] = [];
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const text = await proxyFetch(`${TCBS_ENDPOINT}${symbol}`);
        const item = await text.json();
        if (!item || !item.ask) {
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
          marketCap: item.marketcap ? Number(item.marketcap) : undefined,
          volume24h: item.volume ? Number(item.volume) : undefined,
          lastUpdated: new Date().toISOString(),
          sourceLabel: 'TCBS',
          raw: item,
          score: calculateScore({
            id: symbol,
            symbol,
            name: item.name || symbol,
            type: 'vn-stock',
            currentPrice,
            priceChange24h: delta,
            marketCap: item.marketcap ? Number(item.marketcap) : undefined,
            volume24h: item.volume ? Number(item.volume) : undefined,
            lastUpdated: new Date().toISOString(),
            sourceLabel: 'TCBS',
            score: 0,
          }),
        };
        results.push(asset);
      } catch (error) {
        console.warn('Fetch VN stock failed', symbol, error);
      }
    }),
  );
  return results;
}

export async function fetchNewsFeed() {
  const feedUrl = 'https://cafef.vn/thi-truong-chung-khoan.rss';
  const response = await proxyFetch(feedUrl);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const items = Array.from(doc.querySelectorAll('item')).slice(0, 8);
  return items.map((item) => ({
    title: item.querySelector('title')?.textContent ?? '',
    link: item.querySelector('link')?.textContent ?? '',
    pubDate: item.querySelector('pubDate')?.textContent ?? '',
  }));
}
