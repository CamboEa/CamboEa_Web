'use client';
import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import {
  MyfxbookEconomicCalendarWidget,
  MyfxbookVolatilityWidget,
} from './TradingViewWidgets';
import { MarketsOverviewPanel } from './MarketsOverviewPanel';
import { MARKET_OPTIONS, PAIRS, ViewSkeleton, type ViewMode } from './marketsPageShared';

// Lazy-load heavy view components for better initial load and smaller main bundle
const MarketDepthClient = dynamic(
  () => import('./MarketDepthClient').then((m) => ({ default: () => <m.MarketDepthClient embedded /> })),
  { ssr: false, loading: () => <ViewSkeleton text="ជម្រៅទីផ្សារ" /> }
);

const RetailerDataClient = dynamic(() => import('./RetailerDataClient').then((m) => ({ default: m.RetailerDataClient })), {
  ssr: false,
  loading: () => <ViewSkeleton text="ទិន្នន័យអ្នកលក់រាយ" />,
});

type MarketsPageClientProps = { initialView?: 'overview' | 'retailer' | 'depth' | 'calendar' | 'volatility' };

export function MarketsPageClient({ initialView = 'overview' }: MarketsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
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

    const nextUrl = v === 'overview' ? pathname : `${pathname}?view=${v}`;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router]);

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
              <MarketsOverviewPanel
                overviewQuery={overviewQuery}
                overviewFiltered={overviewFiltered}
                selectedOverviewPair={selectedOverviewPair}
                onQueryChange={setOverviewQuery}
                onSelectPair={(pair) => {
                  setSelectedOverviewPair(pair);
                  setOverviewQuery('');
                }}
              />

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
