'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const MARKET_OPTIONS: { value: 'overview' | 'graphic' | 'depth' | 'retailer'; label: string }[] = [
  { value: 'overview', label: 'ទិដ្ឋភាពទីផ្សារ (Overview)' },
  { value: 'depth', label: 'ជម្រៅទីផ្សារ (Level 1 & 2)' },
  { value: 'graphic', label: 'Graphic (ក្រាហ្វ)' },
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

  const handleMarketDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'overview' | 'graphic' | 'depth' | 'retailer';
    if (value === 'depth') return;
    if (value === 'graphic') router.push('/markets?view=graphic');
    else if (value === 'retailer') router.push('/markets?view=retailer');
    else router.push('/markets');
  };

  const fetchDepth = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/market-depth?symbol=${encodeURIComponent(symbol)}&limit=20`);
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
      setError(e instanceof Error ? e.message : 'Failed to load depth');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    setLoading(true);
    fetchDepth();
  }, [fetchDepth]);

  useEffect(() => {
    const t = setInterval(fetchDepth, 5000);
    return () => clearInterval(t);
  }, [fetchDepth]);

  const decimals = symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 4;
  const level1Decimals = symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 5;

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-wrap items-center gap-4">
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

      {loading && !data && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុកជម្រៅទីផ្សារ...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {data && (
        <>
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
          {(() => {
            const bids = data.bids.slice(0, 15);
            const asks = data.asks.slice(0, 15);
            const maxBidQty = Math.max(...bids.map(([, q]) => parseFloat(q) || 0), 1);
            const maxAskQty = Math.max(...asks.map(([, q]) => parseFloat(q) || 0), 1);
            return (
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
                      {bids.map(([price, qty], i) => {
                        const q = parseFloat(qty) || 0;
                        const pct = maxBidQty > 0 ? (q / maxBidQty) * 100 : 0;
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
                      {asks.map(([price, qty], i) => {
                        const q = parseFloat(qty) || 0;
                        const pct = maxAskQty > 0 ? (q / maxAskQty) * 100 : 0;
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
            );
          })()}
        </>
      )}
    </div>
  );
}
