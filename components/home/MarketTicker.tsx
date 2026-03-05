'use client';

import React, { useEffect, useState } from 'react';

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: number;
  changePercent: number;
}

// Focus: Gold and Bitcoin only
const MARKET_DATA: MarketData[] = [
  { symbol: 'XAU/USD', name: 'Gold', price: '2,035.50', change: 12.30, changePercent: 0.61 },
  { symbol: 'BTC/USD', name: 'Bitcoin', price: '52,345.67', change: 1234.56, changePercent: 2.41 },
];

export const MarketTicker = () => {
  const [tickerData, setTickerData] = useState(MARKET_DATA);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTickerData(prevData =>
        prevData.map(item => ({
          ...item,
          change: item.change + (Math.random() - 0.5) * 2,
          changePercent: item.changePercent + (Math.random() - 0.5) * 0.5,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 py-4 overflow-hidden">
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-white dark:from-gray-800 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-white dark:from-gray-800 to-transparent z-10"></div>

        {/* Scrolling Content */}
        <div className="flex animate-ticker hover:[animation-play-state:paused]">
          {/* Duplicate the content for seamless loop */}
          {[...tickerData, ...tickerData].map((item, index) => (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center gap-3 px-6 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {item.symbol}
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.price}
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.changePercent >= 0 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {Math.abs(item.changePercent).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
