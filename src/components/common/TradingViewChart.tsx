import { useEffect, useMemo, useRef } from 'react';

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
  const containerId = useMemo(
    () => `tv-chart-${symbol.replace(/\W+/g, '-')}-${Math.random().toString(36).slice(2)}`,
    [symbol],
  );

  useEffect(() => {
    const createWidget = () => {
      if (typeof window === 'undefined' || !(window as any).TradingView || !chartRef.current) {
        return;
      }

      const container = chartRef.current;
      container.innerHTML = '';
      new (window as any).TradingView.widget({
        container_id: containerId,
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
    };

    const existingScript = document.getElementById('tradingview-script') as HTMLScriptElement | null;

    if (!existingScript) {
      const widgetScript = document.createElement('script');
      widgetScript.src = 'https://s3.tradingview.com/tv.js';
      widgetScript.id = 'tradingview-script';
      widgetScript.async = true;
      widgetScript.onload = createWidget;
      document.head.appendChild(widgetScript);
    } else if ((window as any).TradingView) {
      createWidget();
    } else {
      existingScript.addEventListener('load', createWidget, { once: true });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
    };
  }, [symbol, type, containerId]);

  return <div id={containerId} ref={chartRef} style={{ width: '100%', minHeight: 520, borderRadius: 22, overflow: 'hidden' }} />;
}
