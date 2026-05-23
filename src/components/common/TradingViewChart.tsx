import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  type: 'crypto' | 'stock';
}

const getTradingViewSymbol = (symbol: string, type: 'crypto' | 'stock') => {
  if (type === 'crypto') {
    return `BINANCE:${symbol}USDT`;
  }
  if (symbol.length > 1) {
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
      if (window && (window as any).TradingView && chartRef.current) {
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
          calendar: true,
          container_id: chartRef.current.id,
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
