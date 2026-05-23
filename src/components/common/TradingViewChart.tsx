import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  type: string; // accept 'crypto', 'vn-stock', 'stock' etc.
}

const getTradingViewSymbol = (symbol: string, type: string) => {
  if (type === 'crypto') {
    return `BINANCE:${symbol}USDT`;
  }
  // For VN stocks map to HOSE/ HNX heuristics
  if (type === 'vn-stock' || type === 'stock') {
    // TradingView may use HOSE or HNX prefixes; default to HOSE
    return `HOSE:${symbol}`;
  }
  return symbol;
};

export default function TradingViewChart({ symbol, type }: TradingViewChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widgetScript = document.createElement('script');
    widgetScript.src = 'https://s3.tradingview.com/tv.js';
    widgetScript.async = true;
    widgetScript.onload = () => {
      if (typeof (window as any) !== 'undefined' && (window as any).TradingView && chartRef.current) {
        new (window as any).TradingView.widget({
          container_id: chartRef.current.id,
          autosize: true,
          symbol: getTradingViewSymbol(symbol, type),
          interval: '60',
          timezone: 'Asia/Ho_Chi_Minh',
          theme: 'dark',
          style: '1',
          locale: 'vi',
          toolbar_bg: '#131722',
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          details: true,
          hotlist: true,
          calendar: true
        });
      }
    };
    document.head.appendChild(widgetScript);
    return () => {
      document.head.removeChild(widgetScript);
    };
  }, [symbol, type]);

  return <div id={`tv-chart-${symbol}`} ref={chartRef} style={{ width: '100%', minHeight: 380 }} />;
}
