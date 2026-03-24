'use client';

import { MyfxbookForexHeatmapWidget, TradingViewTechnicalHeatmap } from './TradingViewWidgets';

type Pair = { label: string; tvSymbol: string };

type MarketsOverviewPanelProps = {
  overviewQuery: string;
  overviewFiltered: Pair[];
  selectedOverviewPair: Pair;
  onQueryChange: (value: string) => void;
  onSelectPair: (pair: Pair) => void;
};

export function MarketsOverviewPanel({
  overviewQuery,
  overviewFiltered,
  selectedOverviewPair,
  onQueryChange,
  onSelectPair,
}: MarketsOverviewPanelProps) {
  return (
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
            onChange={(e) => onQueryChange(e.target.value)}
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
                    onClick={() => onSelectPair(pair)}
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
    </div>
  );
}
