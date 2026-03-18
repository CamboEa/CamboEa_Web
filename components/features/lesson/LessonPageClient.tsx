'use client';

import React, { useEffect, useMemo, useState } from 'react';

type LessonItem = {
  id: string;
  title: string;
  description: string;
  reference: string;
  lessonUrl: string;
  createdAt: string;
};

export function LessonPageClient() {
  const [items, setItems] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/lessons', { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error || 'ផ្ទុកមេរៀនមិនបាន');
          setItems([]);
          return;
        }
        setItems(Array.isArray(json) ? json : []);
      } catch {
        setError('ផ្ទុកមេរៀនមិនបាន');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q) ||
        item.lessonUrl.toLowerCase().includes(q)
    );
  }, [items, query]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុកមេរៀន...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-500 dark:text-gray-400">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-sm text-gray-500 dark:text-gray-400">
        មិនទាន់មានមេរៀននៅឡើយទេ។
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3 justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          បញ្ជីមេរៀន
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ស្វែងរកចំណងជើង ពិពណ៌នា ប្រភព ឬ URL"
          className="w-full sm:w-96 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-6 text-sm text-gray-500 dark:text-gray-400">មិនមានលទ្ធផលត្រូវនឹងពាក្យស្វែងរកទេ។</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ចំណងជើង</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ការពិពណ៌នា</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">ប្រភព/អ្នកនិពន្ធ</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">តំណមេរៀន</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{item.title}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {item.description || 'មិនមានការពិពណ៌នា'}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.reference || '—'}</td>
                  <td className="py-3 px-4">
                    <a
                      href={item.lessonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      បើកមេរៀន →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
