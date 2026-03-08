'use client';

// CamboEA - Forex, Metals & Crypto price table with bias (Twelve Data)

import React, { useState, useMemo, useEffect } from 'react';

export type Bias = 'bullish' | 'bearish' | 'neutral';

export interface PriceRow {
  symbol: string;
  name: string;
  price: number;
  bias: Bias;
  decimals?: number;
}

const FALLBACK_FOREX: PriceRow[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0875, bias: 'bullish', decimals: 4 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2654, bias: 'bearish', decimals: 4 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 149.82, bias: 'bullish', decimals: 2 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', price: 0.6532, bias: 'neutral', decimals: 4 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', price: 1.3589, bias: 'bullish', decimals: 4 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', price: 0.8821, bias: 'bearish', decimals: 4 },
];

const FALLBACK_METALS: PriceRow[] = [
  { symbol: 'XAU/USD', name: 'មាស (Gold)', price: 2035.5, bias: 'bullish', decimals: 2 },
  { symbol: 'XAG/USD', name: 'ប្រាក់ (Silver)', price: 24.18, bias: 'bullish', decimals: 2 },
  { symbol: 'XPT/USD', name: 'ប្លាទីន (Platinum)', price: 918.4, bias: 'neutral', decimals: 2 },
];

const FALLBACK_CRYPTO: PriceRow[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 52345.67, bias: 'bullish', decimals: 2 },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 2845.32, bias: 'bullish', decimals: 2 },
  { symbol: 'XRP/USD', name: 'Ripple', price: 0.5234, bias: 'bearish', decimals: 4 },
  { symbol: 'SOL/USD', name: 'Solana', price: 108.92, bias: 'bullish', decimals: 2 },
];

interface MarketsApiResponse {
  forex: PriceRow[];
  metals: PriceRow[];
  crypto: PriceRow[];
}

function formatPrice(row: PriceRow): string {
  const dec = row.decimals ?? 2;
  if (row.price >= 1000) return row.price.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return row.price.toFixed(dec);
}

function BiasBadge({ bias }: { bias: Bias }) {
  const config = {
    bullish: { label: 'ឡើង', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    bearish: { label: 'ចុះ', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    neutral: { label: 'ឋិតថ្កល់', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  };
  const { label, className } = config[bias];
  const icon = bias === 'bullish' ? '↑' : bias === 'bearish' ? '↓' : '→';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function filterRows(rows: PriceRow[], query: string): PriceRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(
    (r) =>
      r.symbol.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q)
  );
}

function TableSection({ title, rows }: { title: string; rows: PriceRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ស៊ីមបូល</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">តម្លៃបច្ចុប្បន្ន</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ទិសដៅ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.symbol}
                className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900 dark:text-white">{row.symbol}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{row.name}</span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900 dark:text-white">
                  {formatPrice(row)}
                </td>
                <td className="py-3 px-4 text-right">
                  <BiasBadge bias={row.bias} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type MarketCategory = 'all' | 'forex' | 'metals' | 'crypto';

const CATEGORY_OPTIONS: { value: MarketCategory; label: string }[] = [
  { value: 'all', label: 'ទាំងអស់' },
  { value: 'forex', label: 'ប្តូរប្រាក់ (Forex)' },
  { value: 'metals', label: 'លោហៈ (Metals)' },
  { value: 'crypto', label: 'គ្រីបធ័ (Crypto)' },
];

export function MarketsPriceTable() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MarketCategory>('all');
  const [data, setData] = useState<MarketsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchMarkets() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/markets');
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? 'Failed to load');
          setData(null);
          return;
        }
        const forex = json.forex ?? [];
        const metals = json.metals ?? [];
        const crypto = json.crypto ?? [];
        if (forex.length === 0 && metals.length === 0 && crypto.length === 0) {
          setError(json.error ?? 'No data');
          setData(null);
          return;
        }
        setData({ forex, metals, crypto });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Network error');
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const forex = data?.forex ?? FALLBACK_FOREX;
  const metals = data?.metals ?? FALLBACK_METALS;
  const crypto = data?.crypto ?? FALLBACK_CRYPTO;

  const filteredForex = useMemo(() => filterRows(forex, query), [forex, query]);
  const filteredMetals = useMemo(() => filterRows(metals, query), [metals, query]);
  const filteredCrypto = useMemo(() => filterRows(crypto, query), [crypto, query]);

  const showForex = category === 'all' || category === 'forex';
  const showMetals = category === 'all' || category === 'metals';
  const showCrypto = category === 'all' || category === 'crypto';

  const hasResults =
    (showForex && filteredForex.length > 0) ||
    (showMetals && filteredMetals.length > 0) ||
    (showCrypto && filteredCrypto.length > 0);

  return (
    <section className="py-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            តម្លៃបច្ចុប្បន្ន និងទិសដៅ — ប្តូរប្រាក់ លោហៈ និងគ្រីបធ័
          </h2>
          {loading && (
            <span className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុក...</span>
          )}
          {error && !loading && (
            <span className="text-sm text-amber-600 dark:text-amber-400">បង្ហាញទិន្នន័យគំរូ — {error}</span>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="pair-search" className="sr-only">
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
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ស្វែងរកគូ (ឧ. EUR/USD, XAU/USD, BTC)"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="ស្វែងរកគូ"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="លុប"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 py-2">ចម្រោះ៖</span>
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === opt.value
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {showForex && <TableSection title="ប្តូរប្រាក់ (Forex)" rows={filteredForex} />}
          {showMetals && <TableSection title="លោហៈ (Metals)" rows={filteredMetals} />}
          {showCrypto && <TableSection title="គ្រីបធ័ (Crypto)" rows={filteredCrypto} />}
          {!hasResults && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              មិនមានគូផ្គូផ្គងនឹង &quot;{query}&quot;
              {category !== 'all' && ` ក្នុង ${CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? ''}`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
