'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { useInView, widgetCache, WidgetSkeleton } from './widgetShared';

interface TradingViewWidgetProps {
  symbol: string;
  height?: number;
  autosize?: boolean;
}

export const TradingViewWidget = memo(function TradingViewWidget({
  symbol,
  height = 400,
  autosize = false,
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref: viewRef, inView } = useInView();
  const widgetId = `chart-${symbol}`;
  const isCached = widgetCache.get(widgetId) === true;
  const loaded = isLoaded || isCached;

  useEffect(() => {
    if (!inView || !container.current) return;
    if (widgetCache.get(widgetId)) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize,
      symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      height,
      width: '100%',
    });

    script.onload = () => {
      setIsLoaded(true);
      widgetCache.set(widgetId, true);
    };

    container.current.appendChild(script);
  }, [symbol, height, autosize, inView, widgetId]);

  return (
    <div ref={viewRef} style={{ minHeight: height }}>
      {!loaded && <WidgetSkeleton height={height} />}
      <div
        className={`tradingview-widget-container transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
        ref={container}
        style={{ height }}
      >
        <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
});

export const TradingViewTicker = memo(function TradingViewTicker() {
  const container = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!container.current || initialized.current) return;
    initialized.current = true;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX:USDJPY', title: 'USD/JPY' },
        { proName: 'FX:AUDUSD', title: 'AUD/USD' },
        { proName: 'FX:USDCAD', title: 'USD/CAD' },
        { proName: 'FX:USDCHF', title: 'USD/CHF' },
        { proName: 'FX:NZDUSD', title: 'NZD/USD' },
        { proName: 'FX:EURJPY', title: 'EUR/JPY' },
        { proName: 'FX:GBPJPY', title: 'GBP/JPY' },
        { proName: 'TVC:GOLD', title: 'Gold (XAU/USD)' },
        { proName: 'TVC:SILVER', title: 'Silver (XAG/USD)' },
        { proName: 'TVC:PLATINUM', title: 'Platinum (XPT/USD)' },
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin (BTC/USD)' },
        { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum (ETH/USD)' },
        { proName: 'COINBASE:SOLUSD', title: 'Solana (SOL/USD)' },
        { proName: 'BITSTAMP:XRPUSD', title: 'XRP/USD' },
        { proName: 'BINANCE:BNBUSD', title: 'BNB/USD' },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: 'adaptive',
      colorTheme: 'light',
      locale: 'en',
    });

    script.onload = () => setIsLoaded(true);
    container.current.appendChild(script);
  }, []);

  return (
    <div className="min-h-[46px]">
      {!isLoaded && (
        <div className="h-[46px] bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className={`tradingview-widget-container transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        ref={container}
      >
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
});

interface TradingViewHeatmapProps {
  type: 'forex' | 'crypto';
  height?: number;
}

export const TradingViewHeatmap = memo(function TradingViewHeatmap({
  type,
  height = 500,
}: TradingViewHeatmapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref: viewRef, inView } = useInView();
  const widgetId = `heatmap-${type}`;
  const isCached = widgetCache.get(widgetId) === true;
  const loaded = isLoaded || isCached;

  useEffect(() => {
    if (!inView || !container.current) return;
    if (widgetCache.get(widgetId)) return;

    const script = document.createElement('script');

    if (type === 'crypto') {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
      script.innerHTML = JSON.stringify({
        dataSource: 'Crypto',
        blockSize: 'market_cap_calc',
        blockColor: 'change',
        locale: 'en',
        symbolUrl: '',
        colorTheme: 'light',
        hasTopBar: true,
        isDataSet498: true,
        isZoomEnabled: true,
        hasSymbolTooltip: true,
        width: '100%',
        height,
      });
    } else {
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js';
      script.innerHTML = JSON.stringify({
        width: '100%',
        height,
        currencies: ['EUR', 'USD', 'JPY', 'GBP', 'CHF', 'AUD', 'CAD', 'NZD'],
        isTransparent: false,
        colorTheme: 'light',
        locale: 'en',
      });
    }

    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
      widgetCache.set(widgetId, true);
    };

    container.current.appendChild(script);
  }, [type, height, inView, widgetId]);

  return (
    <div ref={viewRef} style={{ minHeight: height }}>
      {!loaded && <WidgetSkeleton height={height} />}
      <div
        className={`tradingview-widget-container transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
        ref={container}
        style={{ height }}
      >
        <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
});

interface TradingViewMiniChartProps {
  symbol: string;
  width?: number | string;
  height?: number;
}

export const TradingViewMiniChart = memo(function TradingViewMiniChart({
  symbol,
  width = '100%',
  height = 220,
}: TradingViewMiniChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref: viewRef, inView } = useInView();

  useEffect(() => {
    if (!inView || !container.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width,
      height,
      locale: 'en',
      dateRange: '12M',
      colorTheme: 'light',
      isTransparent: false,
      autosize: false,
      largeChartUrl: '',
    });

    script.onload = () => setIsLoaded(true);
    container.current.appendChild(script);
  }, [symbol, width, height, inView]);

  return (
    <div ref={viewRef} style={{ minHeight: height }}>
      {!isLoaded && <WidgetSkeleton height={height} />}
      <div
        className={`tradingview-widget-container transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
        ref={container}
        style={{ height }}
      >
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
});

interface TradingViewTechnicalHeatmapProps {
  symbol: string;
  height?: number;
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W' | '1M';
}

export const TradingViewTechnicalHeatmap = memo(function TradingViewTechnicalHeatmap({
  symbol,
  height = 420,
  interval = '1D',
}: TradingViewTechnicalHeatmapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref: viewRef, inView } = useInView();
  const widgetId = `ta-${symbol}-${interval}`;
  const isCached = widgetCache.get(widgetId) === true;
  const loaded = isLoaded || isCached;

  useEffect(() => {
    if (!inView || !container.current) return;
    if (widgetCache.get(widgetId)) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval,
      width: '100%',
      isTransparent: false,
      height,
      symbol,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'en',
      colorTheme: 'light',
    });

    script.onload = () => {
      setIsLoaded(true);
      widgetCache.set(widgetId, true);
    };

    container.current.appendChild(script);
  }, [height, inView, interval, symbol, widgetId]);

  return (
    <div ref={viewRef} style={{ minHeight: height }}>
      {!loaded && <WidgetSkeleton height={height} />}
      <div
        className={`tradingview-widget-container transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
        ref={container}
        style={{ height }}
      >
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
});

const MARKET_OVERVIEW_HEADER_OFFSET = 200;

interface TradingViewMarketOverviewProps {
  height?: number;
  fullHeight?: boolean;
}

export const TradingViewMarketOverview = memo(function TradingViewMarketOverview({
  height = 450,
  fullHeight = false,
}: TradingViewMarketOverviewProps) {
  const container = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dynamicHeight, setDynamicHeight] = useState(500);
  const { ref: viewRef, inView } = useInView();

  const effectiveHeight = fullHeight ? dynamicHeight : height;

  useEffect(() => {
    if (!fullHeight) return;
    const update = () => setDynamicHeight(Math.max(400, window.innerHeight - MARKET_OVERVIEW_HEADER_OFFSET));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [fullHeight]);

  useEffect(() => {
    if (!inView || !container.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'light',
      dateRange: '12M',
      showChart: true,
      locale: 'en',
      width: '100%',
      height: effectiveHeight,
      largeChartUrl: '',
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
      plotLineColorFalling: 'rgba(41, 98, 255, 1)',
      gridLineColor: 'rgba(240, 243, 250, 0)',
      scaleFontColor: 'rgba(106, 109, 120, 1)',
      belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
      belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
      symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
      tabs: [
        {
          title: 'Forex',
          symbols: [
            { s: 'FX:EURUSD', d: 'EUR/USD' },
            { s: 'FX:GBPUSD', d: 'GBP/USD' },
            { s: 'FX:USDJPY', d: 'USD/JPY' },
            { s: 'FX:AUDUSD', d: 'AUD/USD' },
            { s: 'FX:USDCAD', d: 'USD/CAD' },
          ],
          originalTitle: 'Forex',
        },
        {
          title: 'Metals',
          symbols: [
            { s: 'TVC:GOLD', d: 'XAU/USD' },
            { s: 'TVC:SILVER', d: 'XAG/USD' },
            { s: 'TVC:PLATINUM', d: 'XPT/USD' },
          ],
          originalTitle: 'Metals',
        },
        {
          title: 'Crypto',
          symbols: [
            { s: 'BITSTAMP:BTCUSD', d: 'BTC/USD' },
            { s: 'BITSTAMP:ETHUSD', d: 'ETH/USD' },
            { s: 'COINBASE:SOLUSD', d: 'SOL/USD' },
            { s: 'BITSTAMP:XRPUSD', d: 'XRP/USD' },
            { s: 'BINANCE:BNBUSD', d: 'BNB/USD' },
          ],
          originalTitle: 'Crypto',
        },
      ],
    });

    script.onload = () => setIsLoaded(true);
    container.current.appendChild(script);
  }, [effectiveHeight, inView]);

  return (
    <div ref={viewRef} style={{ minHeight: effectiveHeight }}>
      {!isLoaded && <WidgetSkeleton height={effectiveHeight} />}
      <div
        className={`tradingview-widget-container transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
        ref={container}
        style={{ height: effectiveHeight }}
      >
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
});
