'use client';

import React, { useEffect, useState } from 'react';

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
  if (signal === 'sell') {
    return (
      <span className={rose} aria-hidden>
        <svg className={icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-3 3m3 5l-3-3m-3 2V7l3 3" />
        </svg>
      </span>
    );
  }
  return (
    <span className={rose} aria-hidden>
      <svg className={icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-3-3m3 3l-3 3m-3-2v8l3-3" />
      </svg>
    </span>
  );
}

export function RetailerDataClient() {
  const [data, setData] = useState<RetailerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setError(null);
        const res = await fetch('/api/retailer');
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
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((row) => {
          const leftPct = Math.max(0, Math.min(100, row.avgLeft));
          const rightPct = Math.max(0, Math.min(100, row.avgRight));
          const total = leftPct + rightPct;
          const leftWidth = total > 0 ? (leftPct / total) * 100 : 50;
          return (
            <li
              key={row.pair}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/30"
            >
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
              <span className="shrink-0">
                <SignalIcon signal={row.signal} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
