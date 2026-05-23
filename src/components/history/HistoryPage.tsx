import React, { useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { formatCurrency, formatDateTime, formatPercent } from '../../utils/formatters';
import { TradeRecord } from '../../types';

function calculatePnL(record: TradeRecord) {
  const delta = record.direction === 'LONG' ? record.currentPrice - record.entryPrice : record.entryPrice - record.currentPrice;
  const pl = delta * record.leverage * record.size;
  return { pl, pct: (delta / record.entryPrice) * 100 };
}

export default function HistoryPage() {
  const history = useAppStore((state) => state.history);
  const importHistory = useAppStore((state) => state.importHistory);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const [importError, setImportError] = useState('');

  const totalProfit = useMemo(
    () => history.reduce((sum, record) => sum + calculatePnL(record).pl, 0),
    [history],
  );

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as TradeRecord[];
      importHistory(parsed);
    } catch (error) {
      setImportError('File JSON không hợp lệ');
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'mrtungtrade-history.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="page-section">
      <div className="card">
        <div className="card-title">
          <span>Lịch sử giao dịch</span>
          <span className="badge">Tổng lợi nhuận: {formatCurrency(totalProfit)}</span>
        </div>
        <div className="grid-2">
          <div className="card" style={{ padding: '18px' }}>
            <div className="card-title">
              <span>Import / Export</span>
              <button className="secondary-button" type="button" onClick={() => setActiveTab('calc')}>
                Thêm vị thế mới
              </button>
            </div>
            <div className="input-group">
              <label>
                Nhập file JSON
                <input type="file" accept="application/json" onChange={handleImport} />
              </label>
              <button className="primary" type="button" onClick={handleExport}>
                Xuất dữ liệu JSON
              </button>
              {importError && <div style={{ color: '#ff7a7a' }}>{importError}</div>}
            </div>
          </div>
          <div className="card" style={{ padding: '18px' }}>
            <div className="card-title">
              <span>Hướng dẫn</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, display: 'grid', gap: 8 }}>
              <div>1. Lưu lại vị thế trong Calc để ghi lịch sử.</div>
              <div>2. Tải về file JSON để sao lưu khi đổi thiết bị.</div>
              <div>3. Import lại JSON để phục hồi toàn bộ danh mục.</div>
            </div>
          </div>
        </div>
        <div className="card-list">
          {history.length === 0 ? (
            <div style={{ color: '#8892b0' }}>Chưa có lệnh nào trong lịch sử.</div>
          ) : (
            history.map((record) => {
              const { pl, pct } = calculatePnL(record);
              return (
                <div key={record.id} className="card" style={{ padding: '16px' }}>
                  <div className="asset-title">
                    <strong>{record.assetName}</strong>
                    <span className="badge">{record.direction}</span>
                  </div>
                  <div className="asset-meta" style={{ display: 'grid', gap: 6 }}>
                    <span>Entry: {formatCurrency(record.entryPrice)}</span>
                    <span>Current: {formatCurrency(record.currentPrice)}</span>
                    <span>Đòn bẩy: {record.leverage}x</span>
                    <span>Ngày: {formatDateTime(record.createdAt)}</span>
                  </div>
                  <div className="asset-value" style={{ marginTop: 10 }}>
                    <strong className={pl >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(pl)}</strong>
                    <span className={pct >= 0 ? 'text-success' : 'text-danger'}>{formatPercent(pct)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
