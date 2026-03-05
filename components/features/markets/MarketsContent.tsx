'use client';

// Markets Content with Tabbed Interface
// Only loads widgets for the active tab, dramatically improving performance

import React, { useState } from 'react';
import { TradingViewWidget } from './TradingViewWidgets';

// Focus: Gold (XAU/USD) and Bitcoin (BTC/USD) only

const GOLD_SYMBOL = {
  symbol: 'TVC:GOLD',
  name: 'XAU/USD',
  description: 'Gold vs US Dollar',
  icon: 'Au',
  color: 'yellow',
};

const BTC_SYMBOL = {
  symbol: 'BITSTAMP:BTCUSD',
  name: 'BTC/USD',
  description: 'Bitcoin',
  icon: 'BTC',
  color: 'orange',
};

export const MarketsContent = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const symbols = [GOLD_SYMBOL, BTC_SYMBOL];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Live Market Charts</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time price action for Gold and Bitcoin</p>
        </div>

        {/* Quick Symbol Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {symbols.map((item) => (
            <button
              key={item.symbol}
              onClick={() => setSelectedSymbol(selectedSymbol === item.symbol ? null : item.symbol)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                selectedSymbol === item.symbol
                  ? item.color === 'yellow' 
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 scale-105'
                    : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className="text-sm font-bold tracking-wide">{item.icon}</span>
              {item.name}
            </button>
          ))}
          {selectedSymbol && (
            <button
              onClick={() => setSelectedSymbol(null)}
              className="px-6 py-3 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Show Both
            </button>
          )}
        </div>

        {/* Charts Grid */}
        <div className={`grid gap-6 ${selectedSymbol ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
          {symbols.filter(item => !selectedSymbol || item.symbol === selectedSymbol).map((item) => (
            <div 
              key={item.symbol} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tracking-wide px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
                </div>
              </div>
              <TradingViewWidget symbol={item.symbol} height={selectedSymbol ? 600 : 500} />
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-4">
              <span className="text-sm font-bold tracking-wide px-2 py-1 rounded-md bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100">
                Au
              </span>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Gold (XAU/USD)</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Track the world&apos;s most trusted safe-haven asset. Gold prices are influenced by inflation, 
                  geopolitical tensions, and central bank policies.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-4">
              <span className="text-sm font-bold tracking-wide px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100">
                BTC
              </span>
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Bitcoin (BTC/USD)</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Monitor the leading cryptocurrency. Bitcoin prices are driven by adoption, regulation, 
                  institutional interest, and market sentiment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};