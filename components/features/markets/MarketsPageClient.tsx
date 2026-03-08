'use client';

import React, { useState, useMemo } from 'react';
import { TradingViewMarketOverview, TradingViewWidget } from './TradingViewWidgets';
import { TradingSessionZone } from './TradingSessionZone';

type ViewMode = 'overview' | 'graphic';

const PAIRS: { label: string; tvSymbol: string }[] = [
  { label: 'EUR/USD', tvSymbol: 'FX:EURUSD' },
  { label: 'GBP/USD', tvSymbol: 'FX:GBPUSD' },
  { label: 'USD/JPY', tvSymbol: 'FX:USDJPY' },
  { label: 'AUD/USD', tvSymbol: 'FX:AUDUSD' },
  { label: 'USD/CAD', tvSymbol: 'FX:USDCAD' },
  { label: 'USD/CHF', tvSymbol: 'FX:USDCHF' },
  { label: 'XAU/USD', tvSymbol: 'TVC:GOLD' },
  { label: 'XAG/USD', tvSymbol: 'TVC:SILVER' },
  { label: 'XPT/USD', tvSymbol: 'TVC:PLATINUM' },
  { label: 'BTC/USD', tvSymbol: 'BITSTAMP:BTCUSD' },
  { label: 'ETH/USD', tvSymbol: 'BITSTAMP:ETHUSD' },
  { label: 'XRP/USD', tvSymbol: 'BITSTAMP:XRPUSD' },
  { label: 'SOL/USD', tvSymbol: 'COINBASE:SOLUSD' },
  { label: 'BNB/USD', tvSymbol: 'BINANCE:BNBUSD' },
];

const TABS: { id: ViewMode; label: string }[] = [
  { id: 'overview', label: 'ទិដ្ឋភាពទីផ្សារ — Forex, Metals, Crypto' },
  { id: 'graphic', label: 'Graphic' },
];

export function MarketsPageClient() {
  const [view, setView] = useState<ViewMode>('overview');
  const [query, setQuery] = useState('');
  const [selectedPair, setSelectedPair] = useState<{ label: string; tvSymbol: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAIRS;
    return PAIRS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.label.replace('/', '').toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          ទិដ្ឋភាពទីផ្សារ
        </h2>

        {/* Tab buttons */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === tab.id
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content: Overview */}
      {view === 'overview' && (
        <div className="space-y-2">
          <TradingViewMarketOverview height={420} />
        </div>
      )}

      {/* Content: Graphic (search + chart) */}
      {view === 'graphic' && (
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <label htmlFor="pair-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ស្វែងរកគូ
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                id="pair-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ឧ. EUR/USD, XAU/USD, BTC"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="ស្វែងរកគូ"
              />
            </div>
            {query.trim() && (
              <ul className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">មិនមានគូផ្គូផ្គង</li>
                ) : (
                  filtered.map((pair) => (
                    <li key={pair.tvSymbol}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPair(pair);
                          setQuery('');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                      >
                        <span>{pair.label}</span>
                        <span className="text-gray-400 text-xs">ចុចដើម្បីមើលក្រាហ្វ</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {selectedPair ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ក្រាហ្វ — {selectedPair.label}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPair(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                >
                  បិទ
                </button>
              </div>
              <TradingViewWidget symbol={selectedPair.tvSymbol} height={420} />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ស្វែងរកគូខាងលើ រួចចុចដើម្បីមើលក្រាហ្វ
              </p>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Right sidebar: Session zone */}
      <div className="lg:order-2 lg:sticky lg:top-6 lg:self-start">
        <TradingSessionZone />
      </div>
    </div>
  );
}
