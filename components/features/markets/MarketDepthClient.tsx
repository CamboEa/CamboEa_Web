'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const MARKET_OPTIONS: { value: 'overview' | 'depth' | 'retailer'; label: string }[] = [
  { value: 'overview', label: 'ទិដ្ឋភាពទីផ្សារ (Overview)' },
  { value: 'depth', label: 'ជម្រៅទីផ្សារ (Level 1 & 2)' },
  { value: 'retailer', label: 'ទិន្នន័យអ្នកលក់រាយ (Retailer)' },
];

const SYMBOLS = [
  { value: 'BTCUSDT', label: 'BTC/USDT' },
  { value: 'ETHUSDT', label: 'ETH/USDT' },
  { value: 'BNBUSDT', label: 'BNB/USDT' },
  { value: 'SOLUSDT', label: 'SOL/USDT' },
  { value: 'XRPUSDT', label: 'XRP/USDT' },
  { value: 'DOGEUSDT', label: 'DOGE/USDT' },
  { value: 'ADAUSDT', label: 'ADA/USDT' },
  { value: 'AVAXUSDT', label: 'AVAX/USDT' },
  { value: 'EURUSD', label: 'EUR/USD' },
  { value: 'GBPUSD', label: 'GBP/USD' },
  { value: 'USDJPY', label: 'USD/JPY' },
  { value: 'XAUUSD', label: 'XAU/USD (Gold)' },
];

type DepthState = {
  symbol: string;
  lastPrice: string;
  bidPrice: string;
  askPrice: string;
  priceChangePercent: string;
  bids: [string, string][];
  asks: [string, string][];
} | null;

function MyfxbookForexRatesWidget({ height = 430 }: { height?: number }) {
  return (
    <div className="space-y-2">
      <div style={{ height }}>
        <iframe
          src="https://widget.myfxbook.com/widget/market-quotes.html?symbols=XAUUSD,XAGAUD,EURGBP,EURUSD,GBPJPY,GBPUSD,USDJPY"
          style={{ border: 0, width: '100%', height: '100%' }}
          title="Forex Rates"
          loading="lazy"
        />
      </div>
      <div className="mt-2">       
      </div>
    </div>
  );
}

function formatNum(s: string, decimals: number): string {
  const n = parseFloat(s);
  if (Number.isNaN(n)) return s;
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function spread(bid: string, ask: string): string {
  const b = parseFloat(bid);
  const a = parseFloat(ask);
  if (Number.isNaN(b) || Number.isNaN(a)) return '—';
  return (a - b).toFixed(4);
}

type MarketDepthClientProps = { embedded?: boolean };

export function MarketDepthClient({ embedded = false }: MarketDepthClientProps) {
  const router = useRouter();
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [data, setData] = useState<DepthState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastToastErrorRef = useRef<string | null>(null);

  const handleMarketDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'overview' | 'depth' | 'retailer';
    if (value === 'depth') return;
    if (value === 'retailer') router.push('/markets?view=retailer');
    else router.push('/markets');
  };

  const fetchDepth = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/m?symbol=${encodeURIComponent(symbol)}&limit=20`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || j.detail || `HTTP ${res.status}`);
      }
      const j = await res.json();
      setData({
        symbol: j.symbol,
        lastPrice: j.lastPrice ?? '',
        bidPrice: j.bidPrice ?? '',
        askPrice: j.askPrice ?? '',
        priceChangePercent: j.priceChangePercent ?? '',
        bids: Array.isArray(j.bids) ? j.bids : [],
        asks: Array.isArray(j.asks) ? j.asks : [],
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load depth';
      setError(message);
      if (lastToastErrorRef.current !== message) {
        toast.error(message);
        lastToastErrorRef.current = message;
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (!error) {
      lastToastErrorRef.current = null;
    }
  }, [error]);

  useEffect(() => {
    setLoading(true);
    fetchDepth();
  }, [fetchDepth]);

  // Pause polling when tab is hidden to save network and CPU
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const schedule = () => {
      if (document.visibilityState === 'visible') {
        if (!intervalId) intervalId = setInterval(fetchDepth, 5000);
      } else {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };
    schedule();
    document.addEventListener('visibilitychange', schedule);
    return () => {
      document.removeEventListener('visibilitychange', schedule);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchDepth]);

  const decimals = useMemo(() => {
    const isForex = ['EURUSD', 'GBPUSD', 'USDJPY'].includes(symbol);
    const isMetal = symbol === 'XAUUSD' || symbol === 'XAUTUSD';
    return symbol.includes('BTC') || symbol.includes('ETH') ? 2
      : symbol === 'USDJPY' ? 3
      : isMetal ? 2
      : isForex ? 5
      : 4;
  }, [symbol]);

  const level1Decimals = useMemo(() => {
    const isForex = ['EURUSD', 'GBPUSD', 'USDJPY'].includes(symbol);
    const isMetal = symbol === 'XAUUSD' || symbol === 'XAUTUSD';
    return symbol.includes('BTC') || symbol.includes('ETH') || isMetal ? 2
      : symbol === 'USDJPY' ? 3
      : isForex ? 5
      : 5;
  }, [symbol]);

  const orderBookDerived = useMemo(() => {
    if (!data) return null;
    const bids = data.bids.slice(0, 15);
    const asks = data.asks.slice(0, 15);
    const maxBidQty = Math.max(...bids.map(([, q]) => parseFloat(q) || 0), 1);
    const maxAskQty = Math.max(...asks.map(([, q]) => parseFloat(q) || 0), 1);
    return { bids, asks, maxBidQty, maxAskQty };
  }, [data]);

  return (
    <div className="space-y-6 mb-8">

      {loading && !data && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុកជម្រៅទីផ្សារ...</p>
        </div>
      )}

      {error && !loading && !data && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-500 dark:text-gray-400">
          No depth data available.
        </div>
      )}

      {data && (
        <> 
          {/* Level 2 - Order book (redesigned) */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Forex Rates 
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                តារាងតម្លៃប្ដូរប្រាក់ផ្ទាល់ និងឧបករណ៍សំខាន់ៗសម្រាប់ពិនិត្យល្បឿនទីផ្សារ។
              </p>
            </div>
            <div className="p-3 sm:p-4">
              <MyfxbookForexRatesWidget height={430} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-7">
        {!embedded && (
          <select
            value="depth"
            onChange={handleMarketDropdownChange}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            aria-label="ជ្រើសរើសទិដ្ឋភាពទីផ្សារ"
          >
            {MARKET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          គូរប្រាក់
        </label>
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
        >
          {SYMBOLS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {data && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ធ្វើឱ្យស្រស់រាល់ ៥ វិនាទី
          </span>
        )}
      </div>
      {/* Help frame (always visible) */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
          ព័ត៌មាននេះជួយ Trade របៀបណា?
        </h3>
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1.5">Level 1 — តម្លៃដេញថ្លៃ / យល់ព្រម / ថ្លៃចុងក្រោយ</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              បង្ហាញតម្លៃដេញថ្លៃ (Bid) និងយល់ព្រម (Ask) ល្អបំផុត រួមទាំងថ្លៃចុងក្រោយ និងចន្លោះ (Spread)។
              ជួយអ្នកវាយតម្លៃថ្លៃធ្វើដំណើរ ពេលវេលាចូល-ចេញដែលសមរម្យ និងថ្លៃដែលទីផ្សារពិតជាធ្វើដំណើរនៅពេលនេះ។
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1.5">Level 2 — ជម្រៅទីផ្សារ (Order Book)</p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              បង្ហាញបញ្ជីដេញថ្លៃ និងយល់ព្រមជាច្រើនកម្រិត។
              ជួយអ្នកមើលថាមានការគាំទ្រ ឬការទប់ទល់នៅតម្លៃណា តើមានសារៈសំខាន់ប៉ុណ្ណានៅជិតតម្លៃបច្ចុប្បន្ន និងធ្វើឱ្យអ្នករៀបចំការចូល-ចេញឱ្យប្រសើរ។
            </p>
          </div>
        </div>
      </div>
                   {/* Level 1 */}
                   <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Level 1 — តម្លៃដេញថ្លៃ / តម្លៃយល់ព្រម / ថ្លៃចុងក្រោយ
              </h2>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ថ្លៃចុងក្រោយ (Last)</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">
                  {formatNum(data.lastPrice, level1Decimals)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ដេញថ្លៃ (Bid)</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatNum(data.bidPrice, level1Decimals)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">យល់ព្រម (Ask)</p>
                <p className="text-lg font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatNum(data.askPrice, level1Decimals)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ចន្លោះ (Spread)</p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  {spread(data.bidPrice, data.askPrice)}
                </p>
              </div>
            </div>
            {data.priceChangePercent && (
              <div className="px-4 pb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">ផ្លាស់ប្តូរ 24h</p>
                <p
                  className={`text-sm font-medium tabular-nums ${
                    parseFloat(data.priceChangePercent) >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {parseFloat(data.priceChangePercent) >= 0 ? '+' : ''}
                  {formatNum(data.priceChangePercent, 2)}%
                </p>
              </div>
            )}
          </div>


          {/* Level 2 - Order book (redesigned) */}
          {orderBookDerived && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    ជម្រៅទីផ្សារ (Order Book)
                  </h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                    ចន្លោះ {spread(data.bidPrice, data.askPrice)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-0">
                  {/* Bids */}
                  <div className="border-r border-gray-200 dark:border-gray-700">
                    <div className="px-3 py-2 grid grid-cols-2 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      <span>ដេញថ្លៃ (Bid)</span>
                      <span className="text-right">ចំនួន</span>
                    </div>
                    <div>
                      {orderBookDerived.bids.map(([price, qty], i) => {
                        const q = parseFloat(qty) || 0;
                        const pct = orderBookDerived.maxBidQty > 0 ? (q / orderBookDerived.maxBidQty) * 100 : 0;
                        return (
                          <div
                            key={`b-${i}`}
                            className="relative px-3 py-1.5 grid grid-cols-2 gap-2 items-center text-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-r"
                              style={{ width: `${pct}%` }}
                              aria-hidden
                            />
                            <span className="relative z-10 tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                              {formatNum(price, decimals)}
                            </span>
                            <span className="relative z-10 text-right tabular-nums text-gray-600 dark:text-gray-400">
                              {formatNum(qty, 4)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Asks */}
                  <div>
                    <div className="px-3 py-2 grid grid-cols-2 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      <span>យល់ព្រម (Ask)</span>
                      <span className="text-right">ចំនួន</span>
                    </div>
                    <div>
                      {orderBookDerived.asks.map(([price, qty], i) => {
                        const q = parseFloat(qty) || 0;
                        const pct = orderBookDerived.maxAskQty > 0 ? (q / orderBookDerived.maxAskQty) * 100 : 0;
                        return (
                          <div
                            key={`a-${i}`}
                            className="relative px-3 py-1.5 grid grid-cols-2 gap-2 items-center text-sm hover:bg-rose-50/50 dark:hover:bg-rose-900/10"
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-rose-500/10 dark:bg-rose-500/20 rounded-r"
                              style={{ width: `${pct}%` }}
                              aria-hidden
                            />
                            <span className="relative z-10 tabular-nums font-medium text-rose-600 dark:text-rose-400">
                              {formatNum(price, decimals)}
                            </span>
                            <span className="relative z-10 text-right tabular-nums text-gray-600 dark:text-gray-400">
                              {formatNum(qty, 4)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
          )}
        </>
      )}
    </div>
  );
}
