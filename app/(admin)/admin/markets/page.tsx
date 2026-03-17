'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Bias = 'bullish' | 'bearish' | 'neutral';

type MarketCategory = 'forex' | 'metals';

interface MarketBiasFormRow {
  symbol: string;
  name: string;
  category: MarketCategory;
  bias: Bias;
}

interface ApiBiasRow {
  symbol: string;
  category: MarketCategory;
  bias: Bias;
}

const FOREX_ROWS: MarketBiasFormRow[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', bias: 'neutral' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'forex', bias: 'neutral' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'forex', bias: 'neutral' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'forex', bias: 'neutral' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'forex', bias: 'neutral' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'forex', bias: 'neutral' },
];

const METAL_ROWS: MarketBiasFormRow[] = [
  { symbol: 'XAU/USD', name: 'មាស (Gold)', category: 'metals', bias: 'neutral' },
  { symbol: 'XAG/USD', name: 'ប្រាក់ (Silver)', category: 'metals', bias: 'neutral' },
  { symbol: 'XPT/USD', name: 'ប្លាទីន (Platinum)', category: 'metals', bias: 'neutral' },
];

const BIAS_OPTIONS: { value: Bias; label: string }[] = [
  { value: 'bullish', label: 'ឡើង (Bullish)' },
  { value: 'bearish', label: 'ចុះ (Bearish)' },
  { value: 'neutral', label: 'ឋិតថ្កល់ (Neutral)' },
];

export default function AdminMarketsPage() {
  const [rows, setRows] = useState<MarketBiasFormRow[]>(() => [...FOREX_ROWS, ...METAL_ROWS]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBiases() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/markets/bias');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'មិនអាចផ្ទុកទិសដៅទីផ្សារ');
        }
        const rowsData = (data ?? []) as ApiBiasRow[] | null;
        if (!data || cancelled) {
          return;
        }

        if (rowsData) {
          setRows((current) =>
            current.map((row) => {
              const match = rowsData.find(
                (b) => b.symbol === row.symbol && b.category === row.category
              );
              return match ? { ...row, bias: match.bias } : row;
            })
          );
        }
      } catch (e) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'មិនអាចផ្ទុកទិន្នន័យ';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBiases();

    return () => {
      cancelled = true;
    };
  }, []);

  const forexRows = useMemo(
    () => rows.filter((r) => r.category === 'forex'),
    [rows]
  );
  const metalRows = useMemo(
    () => rows.filter((r) => r.category === 'metals'),
    [rows]
  );

  const handleBiasChange = (symbol: string, category: MarketCategory, bias: Bias) => {
    setRows((prev) =>
      prev.map((row) =>
        row.symbol === symbol && row.category === category ? { ...row, bias } : row
      )
    );
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: ApiBiasRow[] = rows.map((r) => ({
        symbol: r.symbol,
        category: r.category,
        bias: r.bias,
      }));

      const res = await fetch('/api/admin/markets/bias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: payload }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'រក្សាទុកបរាជ័យ');
      }

      toast.success('រក្សាទុកទិសដៅទីផ្សាររួចរាល់');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'រក្សាទុកបរាជ័យ';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            ទីផ្សារ — កំណត់ទិសដៅ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-2xl">
            កំណត់ &quot;ទិសដៅ&quot; សម្រាប់ការវិភាគទីផ្សារ នៅលើទំព័រ
            &quot;ការវិភាគ — តម្លៃបច្ចុប្បន្ន និងទិសដៅ&quot;។ អាចកំណត់សម្រាប់
            ប្តូរប្រាក់ (Forex) និង លោហៈ (Metals) ប៉ុណ្ណោះ។ ទិន្នន័យ Crypto នៅតែគណនា
            ដោយស្វ័យប្រវត្តិ។
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកំណត់'}
        </button>
      </div>

      {loading && (
        <p className="text-gray-500 dark:text-gray-400 mb-4">កំពុងផ្ទុកទិន្នន័យ...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          {error}
        </p>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            ប្តូរប្រាក់ (Forex)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    ស៊ីមបូល
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    ឈ្មោះ
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    ទិសដៅ (Analysis)
                  </th>
                </tr>
              </thead>
              <tbody>
                {forexRows.map((row) => (
                  <tr
                    key={row.symbol}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-white">
                      {row.symbol}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {row.name}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={row.bias}
                        onChange={(e) =>
                          handleBiasChange(
                            row.symbol,
                            row.category,
                            e.target.value as Bias
                          )
                        }
                        className="min-w-[180px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {BIAS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            លោហៈ (Metals)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    ស៊ីមបូល
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    ឈ្មោះ
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    ទិសដៅ (Analysis)
                  </th>
                </tr>
              </thead>
              <tbody>
                {metalRows.map((row) => (
                  <tr
                    key={row.symbol}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-white">
                      {row.symbol}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {row.name}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={row.bias}
                        onChange={(e) =>
                          handleBiasChange(
                            row.symbol,
                            row.category,
                            e.target.value as Bias
                          )
                        }
                        className="min-w-[180px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {BIAS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
