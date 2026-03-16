'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TradingViewWidget } from './TradingViewWidgets';

// Lazy-load heavy view components for better initial load and smaller main bundle
const MarketDepthClient = dynamic(
  () => import('./MarketDepthClient').then((m) => ({ default: () => <m.MarketDepthClient embedded /> })),
  { ssr: false, loading: () => <ViewSkeleton text="ជម្រៅទីផ្សារ" /> }
);

const RetailerDataClient = dynamic(() => import('./RetailerDataClient').then((m) => ({ default: m.RetailerDataClient })), {
  ssr: false,
  loading: () => <ViewSkeleton text="ទិន្នន័យអ្នកលក់រាយ" />,
});

const MarketSummaryClient = dynamic(() => import('./MarketSummaryClient').then((m) => ({ default: m.MarketSummaryClient })), {
  ssr: false,
  loading: () => <ViewSkeleton text="ទិដ្ឋភាពសង្ខេប" />,
});

function ViewSkeleton({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 flex flex-col items-center justify-center min-h-[320px]">
      <div className="w-9 h-9 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុក {text}...</p>
    </div>
  );
}

type ViewMode = 'overview' | 'graphic' | 'retailer' | 'depth';

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

const MARKET_OPTIONS: { value: 'overview' | 'graphic' | 'depth' | 'retailer'; label: string }[] = [
  { value: 'overview', label: 'ទិដ្ឋភាពទីផ្សារ (Overview)' },
  { value: 'depth', label: 'ជម្រៅទីផ្សារ (Level 1 & 2)' },
  { value: 'graphic', label: 'Graphic (ក្រាហ្វ)' },
  { value: 'retailer', label: 'ទិន្នន័យអ្នកលក់រាយ (Retailer)' },
];

type MarketsPageClientProps = { initialView?: 'overview' | 'graphic' | 'retailer' | 'depth' };

export function MarketsPageClient({ initialView = 'retailer' }: MarketsPageClientProps) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [dropdownValue, setDropdownValue] = useState<'overview' | 'graphic' | 'depth' | 'retailer'>(initialView);
  const [query, setQuery] = useState('');
  const [selectedPair, setSelectedPair] = useState<{ label: string; tvSymbol: string } | null>({ label: 'XAU/USD', tvSymbol: 'TVC:GOLD' });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAIRS;
    return PAIRS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.label.replace('/', '').toLowerCase().includes(q)
    );
  }, [query]);

  const handleDropdownChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'overview' | 'graphic' | 'depth' | 'retailer';
    setDropdownValue(value);
    setView(value);
  }, []);

  const setViewTo = useCallback((v: ViewMode) => {
    setDropdownValue(v);
    setView(v);
  }, []);

  return (
    <div className="flex flex-col gap-0">
      {/* Card container overlapping hero */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
        {/* View tabs */}
        <div className="flex flex-wrap gap-1 p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
          {MARKET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setViewTo(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                dropdownValue === opt.value
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 dark:shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
              aria-pressed={dropdownValue === opt.value}
              aria-label={opt.label}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 min-h-[360px] ">
          {view === 'overview' && (
            <div className="rounded-xl overflow-hidden">
              <MarketSummaryClient />
            </div>
          )}

          {view === 'depth' && (
            <div className="rounded-xl overflow-hidden">
              <MarketDepthClient />
            </div>
          )}

          {view === 'retailer' && (
            <div className="rounded-xl overflow-hidden w-full">
              <RetailerDataClient />
            </div>
          )}

          {view === 'graphic' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                  <label htmlFor="pair-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      aria-label="ស្វែងរកគូ"
                    />
                  </div>
                </div>
              </div>
              {query.trim() && (
                <ul className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
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
                          className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between rounded-lg"
                        >
                          <span className="font-medium">{pair.label}</span>
                          <span className="text-gray-400 text-xs">ចុចដើម្បីមើលក្រាហ្វ</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}

              {selectedPair ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      ក្រាហ្វ — {selectedPair.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPair(null)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      បិទ
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <TradingViewWidget symbol={selectedPair.tvSymbol} height={420} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 py-16 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    ស្វែងរកគូខាងលើ រួចចុចដើម្បីមើលក្រាហ្វ
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
