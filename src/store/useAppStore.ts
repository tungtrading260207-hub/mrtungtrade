import { create } from 'zustand';
import { AssetAnalysis, AssetSummary, TradeRecord } from '../types';
import { fetchCryptoRadar, fetchNewsFeed, fetchVnStockRadar } from '../data/api';

interface AppState {
  activeTab: 'dashboard' | 'analysis' | 'calc' | 'history';
  radarAssets: AssetSummary[];
  selectedAssetId: string | null;
  analysis: AssetAnalysis | null;
  news: Array<{ title: string; link: string; pubDate: string }>;
  history: TradeRecord[];
  loading: boolean;
  error: string | null;
  loadRadar: () => Promise<void>;
  selectAsset: (assetId: string) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  addTrade: (record: TradeRecord) => void;
  refreshHistoryPrices: () => void;
  importHistory: (records: TradeRecord[]) => void;
}

const vnStockSymbols = ['SSI', 'VCB', 'FPT', 'HPG', 'VNM'];
const STORAGE_KEY = 'mrtungtrade_history';

function loadHistoryFromStorage(): TradeRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TradeRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function scoreStep(amount: number, threshold: number) {
  return amount >= threshold;
}

function calculateAnalysis(asset: AssetSummary): AssetAnalysis {
  const growth = asset.priceChange24h;
  const steps = [
    {
      title: 'Hồ sơ & Vĩ mô',
      description: 'Đánh giá động lực giá, tin tức và đà tăng/giảm',
      passed: growth >= 1,
      weight: 10,
    },
    {
      title: 'Thanh khoản',
      description: 'Khối lượng 24 giờ đủ lớn để vào/ra nhanh',
      passed: scoreStep(asset.volume24h ?? 0, 10_000_000),
      weight: 10,
    },
    {
      title: 'Quy mô thị trường',
      description: 'Vốn hóa phù hợp với tính rủi ro',
      passed: asset.marketCap ? scoreStep(asset.marketCap, 500_000_000) : false,
      weight: 10,
    },
    {
      title: 'Điểm kỹ thuật',
      description: 'Kiểm tra đà giá và thay đổi 24h',
      passed: growth > 2,
      weight: 10,
    },
    {
      title: 'Trạng thái sóng',
      description: 'Ước lượng xu hướng đang trong bước tăng hay thoái lui',
      passed: growth >= 0,
      weight: 10,
    },
    {
      title: 'Rủi ro quá mua',
      description: 'Giảm điểm nếu đà tăng quá nóng trong 24 giờ',
      passed: Math.abs(growth) < 12,
      weight: 10,
    },
    {
      title: 'Tín hiệu cân bằng',
      description: 'Xem xét sức mạnh chênh lệch giá tăng/giảm',
      passed: Math.abs(growth) >= 1,
      weight: 10,
    },
    {
      title: 'Nguồn dữ liệu',
      description: 'Nền tảng lấy dữ liệu từ API công khai hoặc proxy chính xác',
      passed: true,
      weight: 10,
    },
    {
      title: 'Độ tin cậy',
      description: 'Xác thực dữ liệu đầu vào để giảm rủi ro sai sót',
      passed: !!asset.sourceLabel,
      weight: 10,
    },
    {
      title: 'Kết luận chiến thuật',
      description: 'Tổng hợp điểm để xác định tín hiệu kèo',
      passed: asset.score >= 60,
      weight: 10,
    },
  ];

  const totalScore = steps.reduce((sum, step) => sum + (step.passed ? step.weight : 0), 0);
  const score = Math.min(100, Math.max(0, Math.round(totalScore)));

  return {
    assetId: asset.id,
    score,
    steps,
    signal: score > 70 ? 'KÈO VÀNG' : score > 55 ? 'CHỜ KÍCH NỔ' : 'GIỮ VỊ THẾ',
  };
}

function buildAnalysisForAsset(asset: AssetSummary) {
  return calculateAnalysis(asset);
}

const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'dashboard',
  radarAssets: [],
  selectedAssetId: null,
  analysis: null,
  news: [],
  history: loadHistoryFromStorage(),
  loading: false,
  error: null,
  loadRadar: async () => {
    set({ loading: true, error: null });
    try {
      const [crypto, vn] = await Promise.all([
        fetchCryptoRadar(),
        fetchVnStockRadar(vnStockSymbols),
      ]);
      const radarAssets = [...crypto.slice(0, 8), ...vn].sort((a, b) => b.score - a.score);
      const news = await fetchNewsFeed();
      set({ radarAssets, news });
      if (!get().selectedAssetId && radarAssets.length > 0) {
        const firstAsset = radarAssets[0];
        set({ selectedAssetId: firstAsset.id, analysis: buildAnalysisForAsset(firstAsset) });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  selectAsset: (assetId: string) => {
    const asset = get().radarAssets.find((item) => item.id === assetId);
    if (!asset) return;
    set({ selectedAssetId: assetId, analysis: buildAnalysisForAsset(asset) });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  addTrade: (record) => {
    const history = [record, ...get().history];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    set({ history });
  },
  refreshHistoryPrices: () => {
    const assetsById = Object.fromEntries(get().radarAssets.map((asset) => [asset.id, asset]));
    const history = get().history.map((trade) => {
      const asset = assetsById[trade.assetId];
      return {
        ...trade,
        currentPrice: asset ? asset.currentPrice : trade.currentPrice,
      };
    });
    set({ history });
  },
  importHistory: (records) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    set({ history: records });
  },
}));

export default useAppStore;
