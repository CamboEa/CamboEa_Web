'use client';

import React, { useEffect, useMemo, useState, memo } from 'react';

export type RetailerRow = {
  pair: string;
  avgLeft: number;
  avgRight: number;
  signal: 'buy' | 'sell' | 'neutral';
  runAt: string;
};

function formatPair(pair: string): string {
  if (pair.length <= 6) return pair;
  const match = pair.match(/^([A-Z]{3})([A-Z0-9]{3,})$/);
  if (match) return `${match[1]}/${match[2]}`;
  return pair;
}

function SignalIcon({ signal }: { signal: 'buy' | 'sell' | 'neutral' }) {
  const box = 'flex items-center justify-center w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  const rose = 'flex items-center justify-center w-6 h-6 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400';
  const icon = 'w-4 h-4';
  if (signal === 'neutral') {
    return (
      <span className={box} aria-hidden>
        <svg className={icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 9h14M5 15h14" />
        </svg>
      </span>
    );
  }
  const emerald = 'flex items-center justify-center w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400';
  if (signal === 'sell') {
    return (
      <span className={rose} aria-hidden>
        <svg className={icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    );
  }
  return (
    <span className={emerald} aria-hidden>
      <svg className={icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </span>
  );
}

const SIGNAL_HINT: Record<string, string> = {
  buy: 'រកឱកាសទិញ',
  sell: 'រកឱកាសលក់',
  neutral: 'អព្យាក្រឹត',
};

const FIAT_CODES = new Set([
  'AUD',
  'CAD',
  'CHF',
  'CNH',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'JPY',
  'MXN',
  'NOK',
  'NZD',
  'PLN',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
]);

const CRYPTO_CODES = [
  'BTC',
  'ETH',
  'LTC',
  'XRP',
  'BCH',
  'XMR',
  'ZEC',
  'DASH',
  'DSH',
  'ETC',
  'NEO',
  'EOS',
  'ADA',
  'SOL',
  'DOT',
  'UNI',
  'TRX',
  'XLM',
  'ICP',
  'MKR',
  'FIL',
  'AXS',
  'ENJ',
  'ZIL',
  'LRC',
  'GRT',
  'BNT',
  'YFI',
  'XTZ',
  'OMG',
  'QTM',
  'IOT',
  'IOTA',
  'VET',
  'FET',
  'BAT',
  'FTM',
] as const;

function normalizeSymbol(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z]/g, '');
}

function isMetalSymbol(pair: string): boolean {
  const symbol = normalizeSymbol(pair);
  return (
    symbol.startsWith('XAU') ||
    symbol.startsWith('XAG') ||
    symbol.startsWith('XPT') ||
    symbol.startsWith('XPD')
  );
}

function isCryptoSymbol(pair: string): boolean {
  const symbol = normalizeSymbol(pair);
  return CRYPTO_CODES.some((code) => symbol.includes(code));
}

function isCurrencyPair(pair: string): boolean {
  const symbol = normalizeSymbol(pair);
  if (!/^[A-Z]{6}$/.test(symbol)) return false;
  const base = symbol.slice(0, 3);
  const quote = symbol.slice(3, 6);
  return FIAT_CODES.has(base) && FIAT_CODES.has(quote);
}

const RetailerRowItem = memo(function RetailerRowItem({ row }: { row: RetailerRow }) {
  const leftPct = Math.max(0, Math.min(100, row.avgLeft));
  const rightPct = Math.max(0, Math.min(100, row.avgRight));
  const total = leftPct + rightPct;
  const leftWidth = total > 0 ? (leftPct / total) * 100 : 50;
  const displaySignal: 'buy' | 'sell' | 'neutral' =
    leftPct > rightPct ? 'buy' : rightPct > leftPct ? 'sell' : 'neutral';
  return (
    <li className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <span className="shrink-0 w-14 sm:w-16 text-xs font-bold text-gray-900 dark:text-white tabular-nums">
        {formatPair(row.pair)}
      </span>
      <div className="flex-1 min-w-0 flex h-6 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
        <div
          className="flex items-center justify-center h-full bg-emerald-500 dark:bg-emerald-600 text-white text-[10px] font-semibold tabular-nums"
          style={{ width: `${leftWidth}%`, minWidth: leftPct >= 0.1 ? '1.5rem' : 0 }}
        >
          {leftPct >= 5 ? `${leftPct.toFixed(1)}%` : ''}
        </div>
        <div
          className="flex items-center justify-center h-full bg-rose-400 dark:bg-rose-500 text-white text-[10px] font-semibold tabular-nums"
          style={{ width: `${100 - leftWidth}%`, minWidth: rightPct >= 0.1 ? '1.5rem' : 0 }}
        >
          {rightPct >= 5 ? `${rightPct.toFixed(1)}%` : ''}
        </div>
      </div>
      <span className="shrink-0 flex items-center gap-1.5">
        <SignalIcon signal={displaySignal} />
        <span
          className={`text-[10px] font-medium ${
            displaySignal === 'buy'
              ? 'text-emerald-600 dark:text-emerald-400'
              : displaySignal === 'sell'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {SIGNAL_HINT[displaySignal] ?? displaySignal}
        </span>
      </span>
    </li>
  );
});

export function RetailerDataClient() {
  const [data, setData] = useState<RetailerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'currency' | 'metal' | 'crypto'>('currency');
  const [searchTerm, setSearchTerm] = useState('');
  const grouped = useMemo(() => {
    const currency: RetailerRow[] = [];
    const metal: RetailerRow[] = [];
    const crypto: RetailerRow[] = [];
    const other: RetailerRow[] = [];

    for (const row of data) {
      if (isMetalSymbol(row.pair)) {
        metal.push(row);
      } else if (isCryptoSymbol(row.pair)) {
        crypto.push(row);
      } else if (isCurrencyPair(row.pair)) {
        currency.push(row);
      } else {
        other.push(row);
      }
    }

    return { currency, metal, crypto, other };
  }, [data]);
  const visibleRows = useMemo(() => {
    const rows = grouped[activeFilter];
    const query = searchTerm.trim().toUpperCase();
    if (!query) return rows;
    return rows.filter((row) => row.pair.toUpperCase().includes(query));
  }, [grouped, activeFilter, searchTerm]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setError(null);
        const res = await fetch('/api/retail-outlook', { referrerPolicy: 'no-referrer' });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled && Array.isArray(json)) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load retailer data');
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុកទិន្នន័យអ្នកលក់រាយ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
          ទិន្នន័យអ្នកលក់រាយ (Retailer)
        </h3>
      </div>
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('currency')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeFilter === 'currency'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
            }`}
          >
            Currency ({grouped.currency.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('metal')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeFilter === 'metal'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
            }`}
          >
            Metal ({grouped.metal.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('crypto')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              activeFilter === 'crypto'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
            }`}
          >
            Crypto ({grouped.crypto.length})
          </button>
        </div>
        <div className="mt-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbol (e.g. EURUSD, XAU, BTC)"
            className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>
      {visibleRows.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {visibleRows.map((row, index) => (
            <RetailerRowItem key={`${row.pair}-${index}`} row={row} />
          ))}
        </ul>
      ) : (
        <div className="px-3 py-4 text-xs text-gray-500 dark:text-gray-400">
          No data in this category.
        </div>
      )}
      {grouped.other.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400">
          Other symbols: {grouped.other.length}
        </div>
      )}
    </div>
  );
}
