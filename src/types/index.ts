export type MarketType = 'crypto' | 'vn-stock';

export interface AssetSummary {
  id: string;
  symbol: string;
  name: string;
  type: MarketType;
  currentPrice: number;
  priceChange24h: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated: string;
  sourceLabel: string;
  raw?: Record<string, unknown>;
  score: number;
}

export interface AnalysisStep {
  title: string;
  description: string;
  passed: boolean;
  weight: number;
}

export interface AssetAnalysis {
  assetId: string;
  score: number;
  steps: AnalysisStep[];
  signal: string;
}

export interface TradeRecord {
  id: string;
  assetId: string;
  assetName: string;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  size: number;
  direction: 'LONG' | 'SHORT';
  createdAt: string;
}
