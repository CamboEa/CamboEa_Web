'use client';

import React, { useEffect, useState } from 'react';

const SUMMARY_SYMBOLS: { symbol: string; label: string }[] = [
  { symbol: 'EURUSD', label: 'EUR/USD' },
  { symbol: 'GBPUSD', label: 'GBP/USD' },
  { symbol: 'USDJPY', label: 'USD/JPY' },
  { symbol: 'XAUUSD', label: 'XAU/USD' },
  { symbol: 'BTCUSDT', label: 'BTC/USDT' },
  { symbol: 'ETHUSDT', label: 'ETH/USDT' },
];

type Row = {
  symbol: string;
  label: string;
  lastPrice: string;
  changePercent: string;
  decimals: number;
};

function formatNum(s: string, decimals: number): string {
  const n = parseFloat(s);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function MarketSummaryClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const decimals: Record<string, number> = {
      USDJPY: 3,
      XAUUSD: 2,
      BTCUSDT: 2,
      ETHUSDT: 2,
    };
    async function fetchAll() {
      try {
        setError(null);
        const results = await Promise.all(
          SUMMARY_SYMBOLS.map(async ({ symbol, label }) => {
            const res = await fetch(`/api/m?symbol=${encodeURIComponent(symbol)}&limit=5`);
            if (!res.ok) return null;
            const j = await res.json();
            if (j.error) return null;
            const dec = decimals[symbol] ?? (symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 5);
            return {
              symbol,
              label,
              lastPrice: j.lastPrice ?? '',
              changePercent: j.priceChangePercent ?? '',
              decimals: dec,
            };
          })
        );
        if (!cancelled) {
          setRows(results.filter((r): r is Row => r != null));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load summary');
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 flex flex-col items-center justify-center min-h-[280px]">
        <div className="w-9 h-9 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុកទិដ្ឋភាពសង្ខេប...</p>
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
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          ទិដ្ឋភាពសង្ខេប — តម្លៃសំខាន់ៗ (Market Summary)
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          តម្លៃចុងក្រោយ និងផ្លាស់ប្តូរ ២៤ ម៉ោង សម្រាប់គូរប្រាក់សំខាន់ៗ
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">គូរប្រាក់</th>
              <th className="px-4 py-3 font-medium text-right">ថ្លៃចុងក្រោយ</th>
              <th className="px-4 py-3 font-medium text-right">ផ្លាស់ប្តូរ ២៤ម៉ោង</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const change = parseFloat(r.changePercent);
              const hasChange = !Number.isNaN(change);
              return (
                <tr
                  key={r.symbol}
                  className="border-b border-gray-100 dark:border-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.label}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-900 dark:text-white">
                    {formatNum(r.lastPrice, r.decimals)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {hasChange ? (
                      <span
                        className={change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
                      >
                        {change >= 0 ? '+' : ''}{formatNum(r.changePercent, 2)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
