import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  type: string; // accept 'crypto', 'vn-stock', 'stock' etc.
}

const getTradingViewSymbol = (symbol: string, type: string) => {
  if (type === 'crypto') {
    return `BINANCE:${symbol}USDT`;
  }
  if (type === 'vn-stock' || type === 'stock') {
    return `HOSE:${symbol}`;
  }
  return symbol;
};

export default function TradingViewChart({ symbol, type }: TradingViewChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const widgetScript = document.createElement('script');
    widgetScript.src = 'https://s3.tradingview.com/tv.js';
    widgetScript.id = 'tradingview-script';
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
          toolbar_bg: '#0f1424',
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          details: true,
          hotlist: true,
          calendar: true,
          studies: ['BollingerBands@tv-basicstudies', 'RelativeStrengthIndex@tv-basicstudies'],
          overrides: {
            'paneProperties.background': '#06090f',
            'paneProperties.backgroundGradientStartColor': '#08111d',
            'paneProperties.backgroundGradientEndColor': '#07101d',
            'symbolWatermarkProperties.transparency': 80,
          },
        });
      }
    };

    if (!document.getElementById('tradingview-script')) {
      document.head.appendChild(widgetScript);
    } else if ((window as any).TradingView && chartRef.current) {
      new (window as any).TradingView.widget({
        container_id: chartRef.current.id,
        autosize: true,
        symbol: getTradingViewSymbol(symbol, type),
        interval: '60',
        timezone: 'Asia/Ho_Chi_Minh',
        theme: 'dark',
        style: '1',
        locale: 'vi',
        toolbar_bg: '#0f1424',
        enable_publishing: false,
        allow_symbol_change: true,
        hide_side_toolbar: false,
        details: true,
        hotlist: true,
        calendar: true,
        studies: ['BollingerBands@tv-basicstudies', 'RelativeStrengthIndex@tv-basicstudies'],
        overrides: {
          'paneProperties.background': '#06090f',
          'paneProperties.backgroundGradientStartColor': '#08111d',
          'paneProperties.backgroundGradientEndColor': '#07101d',
          'symbolWatermarkProperties.transparency': 80,
        },
      });
    }

    return () => {
      const existing = document.getElementById('tradingview-script');
      if (existing) {
        existing.remove();
      }
    };
  }, [symbol, type]);

  return <div id={`tv-chart-${symbol}`} ref={chartRef} style={{ width: '100%', minHeight: 520, borderRadius: 22, overflow: 'hidden' }} />;
}
