import { useEffect } from 'react';
import useAppStore from './store/useAppStore';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import DashboardPage from './components/dashboard/DashboardPage';
import RadarPage from './components/radar/RadarPage';
import NewsPage from './components/news/NewsPage';
import AnalysisPage from './components/analysis/AnalysisPage';
import CalcPage from './components/calc/CalcPage';
import HistoryPage from './components/history/HistoryPage';

function App() {
  const activeTab = useAppStore((state) => state.activeTab);
  const loadRadar = useAppStore((state) => state.loadRadar);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const refreshHistoryPrices = useAppStore((state) => state.refreshHistoryPrices);

  useEffect(() => {
    loadRadar();
  }, [loadRadar]);

  useEffect(() => {
    refreshHistoryPrices();
  }, [refreshHistoryPrices]);

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        {loading ? (
          <div className="status-panel">Đang tải dữ liệu thị trường...</div>
        ) : error ? (
          <div className="status-panel status-error">Lỗi: {error}</div>
        ) : (
          <>
            {activeTab === 'radar' && <RadarPage />}
            {activeTab === 'news' && <NewsPage />}
            {activeTab === 'dashboard' && <DashboardPage />}
            {activeTab === 'analysis' && <AnalysisPage />}
            {activeTab === 'calc' && <CalcPage />}
            {activeTab === 'history' && <HistoryPage />}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

export default App;
