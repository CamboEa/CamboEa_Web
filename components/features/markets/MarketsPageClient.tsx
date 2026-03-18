'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  MyfxbookEconomicCalendarWidget,
  MyfxbookForexHeatmapWidget,
  MyfxbookVolatilityWidget,
  TradingViewTechnicalHeatmap,
} from './TradingViewWidgets';

// Lazy-load heavy view components for better initial load and smaller main bundle
const MarketDepthClient = dynamic(
  () => import('./MarketDepthClient').then((m) => ({ default: () => <m.MarketDepthClient embedded /> })),
  { ssr: false, loading: () => <ViewSkeleton text="ជម្រៅទីផ្សារ" /> }
);

const RetailerDataClient = dynamic(() => import('./RetailerDataClient').then((m) => ({ default: m.RetailerDataClient })), {
  ssr: false,
  loading: () => <ViewSkeleton text="ទិន្នន័យអ្នកលក់រាយ" />,
});

function ViewSkeleton({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 flex flex-col items-center justify-center min-h-[320px]">
      <div className="w-9 h-9 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុក {text}...</p>
    </div>
  );
}

type ViewMode = 'overview' | 'retailer' | 'depth' | 'calendar' | 'volatility';

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

const MARKET_OPTIONS: { value: 'overview' | 'depth' | 'retailer' | 'calendar' | 'volatility'; label: string }[] = [
  { value: 'overview', label: 'ទិដ្ឋភាពទីផ្សារ (Overview)' },
  { value: 'depth', label: 'ជម្រៅទីផ្សារ (Level 1 & 2)' },
  { value: 'retailer', label: 'ទិន្នន័យអ្នកលក់រាយ (Retailer)' },
  { value: 'calendar', label: 'ប្រតិទិនសេដ្ឋកិច្ច' },
  { value: 'volatility', label: 'Volatility' },
];

type MarketsPageClientProps = { initialView?: 'overview' | 'retailer' | 'depth' | 'calendar' | 'volatility' };

export function MarketsPageClient({ initialView = 'overview' }: MarketsPageClientProps) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [dropdownValue, setDropdownValue] = useState<'overview' | 'depth' | 'retailer' | 'calendar' | 'volatility'>(initialView);
  const [overviewQuery, setOverviewQuery] = useState('');
  const [selectedOverviewPair, setSelectedOverviewPair] = useState<{ label: string; tvSymbol: string }>({
    label: 'XAU/USD',
    tvSymbol: 'TVC:GOLD',
  });

  const overviewFiltered = useMemo(() => {
    const q = overviewQuery.trim().toLowerCase();
    if (!q) return PAIRS;
    return PAIRS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.label.replace('/', '').toLowerCase().includes(q)
    );
  }, [overviewQuery]);

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
            <div className="rounded-xl overflow-hidden space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Forex Heat Map
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    មើលកម្រិតខ្លាំង/ខ្សោយរបស់រូបិយប័ណ្ណសំខាន់ៗ
                  </p>
                </div>
                <div className="p-3 sm:p-4">
                  <MyfxbookForexHeatmapWidget height={300} />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <label htmlFor="overview-pair-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  ស្វែងរកគូសម្រាប់ផែនទីកម្តៅ
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    id="overview-pair-search"
                    type="text"
                    value={overviewQuery}
                    onChange={(e) => setOverviewQuery(e.target.value)}
                    placeholder="ឧ. EUR/USD, XAU/USD, BTC/USD"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    aria-label="ស្វែងរកគូសម្រាប់ផែនទីកម្តៅ"
                  />
                </div>
                {overviewQuery.trim() && (
                  <ul className="mt-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                    {overviewFiltered.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">មិនមានគូផ្គូផ្គង</li>
                    ) : (
                      overviewFiltered.map((pair) => (
                        <li key={`overview-${pair.tvSymbol}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOverviewPair(pair);
                              setOverviewQuery('');
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between rounded-lg"
                          >
                            <span className="font-medium">{pair.label}</span>
                            <span className="text-gray-400 text-xs">ចុចដើម្បីបង្ហាញ</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    គូបច្ចុប្បន្ន៖ <span className="font-semibold text-gray-900 dark:text-white">{selectedOverviewPair.label}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    ផែនទីកម្តៅ — {selectedOverviewPair.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ប្រើ TradingView Free Technical Analysis (មិនត្រូវការ API Key)
                  </p>
                </div>
                <div className="p-3 sm:p-4">
                  <TradingViewTechnicalHeatmap symbol={selectedOverviewPair.tvSymbol} height={420} interval="1D" />
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 p-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  ព័ត៌មាននេះជួយ Trade របៀបណា?
                </h4>
                <ul className="space-y-1.5 text-sm text-blue-900/90 dark:text-blue-100/90">
                  <li>• មើលទិសដៅសរុប (Buy / Sell / Neutral) លើ timeframes ខុសៗគ្នា ដើម្បីវាយតម្លៃ momentum។</li>
                  <li>• ប្រើជាតម្រងបន្ថែមមុនចូលអាណត្តិ (entry) ដោយផ្គូផ្គងជាមួយ trend និងកម្រិត support/resistance។</li>
                  <li>• ប្រសិនបើសញ្ញាប៉ះទង្គិចគ្នាច្រើន timeframe គួររង់ចាំ confirmation មុនបើក order។</li>
                  <li>• កុំប្រើជាសញ្ញាតែមួយគត់ — គួររួមជាមួយ risk management (SL/TP និង position size)។</li>
                </ul>
                <p className="mt-3 text-xs text-blue-800/80 dark:text-blue-200/80">
                  ចំណាំ៖ Heatmap/Technical summary គឺជាឧបករណ៍ជំនួយសម្រេចចិត្ត មិនមែនការធានាលទ្ធផល។
                </p>
                </div>
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

          {view === 'calendar' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Economic Calendar
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  តាមដានព្រឹត្តិការណ៍សេដ្ឋកិច្ចសំខាន់ៗ និងកម្រិតផលប៉ះពាល់។
                </p>
              </div>
              <div className="p-3 sm:p-4">
                <MyfxbookEconomicCalendarWidget height={620} />
              </div>
            </div>
          )}

          {view === 'volatility' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Market Volatility
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  តាមដានកម្រិតភាពរំញ័រតម្លៃសម្រាប់គូសំខាន់ៗ
                </p>
              </div>
              <div className="p-3 sm:p-4">
                <MyfxbookVolatilityWidget height={300} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
