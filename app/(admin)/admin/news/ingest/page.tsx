'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { NewsIngestProgressModal } from '@/components/admin/NewsIngestProgressModal';

export default function AdminNewsIngestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ingestSources, setIngestSources] = useState<{ id: string; label: string }[]>([]);
  const [ingestSourceId, setIngestSourceId] = useState('');
  const [ingestModal, setIngestModal] = useState<{ open: boolean; runKey: number }>({
    open: false,
    runKey: 0,
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/news/ingest')
      .then(async (r) => {
        if (!r.ok) throw new Error('failed');
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const sources = Array.isArray(data?.sources) ? data.sources : [];
        setIngestSources(sources);
        setIngestSourceId((id) => id || sources[0]?.id || '');
      })
      .catch(() => {
        if (!cancelled) toast.error('ផ្ទុកប្រភពព័ត៌មានមិនបាន');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openIngestModal = () => {
    if (!ingestSourceId) return;
    setIngestModal((s) => ({ open: true, runKey: s.runKey + 1 }));
  };

  const handleIngestComplete = (articleId: string) => {
    toast.success('បានបង្កើតព្រាង — កែសម្រួលហើយផុសនៅពេលរួចរាល់');
    router.push(`/admin/news/${articleId}/edit`);
    router.refresh();
  };

  return (
    <div>
      <NewsIngestProgressModal
        open={ingestModal.open}
        runKey={ingestModal.runKey}
        sourceId={ingestSourceId}
        onClose={() => setIngestModal((s) => ({ ...s, open: false }))}
        onComplete={handleIngestComplete}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI News Scraper</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ទាញយកព័ត៌មានពីប្រភពដែលបានកំណត់ រួចបកប្រែ/សរសេរឡើងវិញដោយ AI ទៅជា Draft។
          </p>
        </div>
        <Link
          href="/admin/news"
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          ← ត្រឡប់ទៅព័ត៌មាន
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-5">
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">កំពុងផ្ទុកប្រភព...</p>
        ) : ingestSources.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">មិនមានប្រភព RSS សម្រាប់ ingest ទេ។</p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="sourceId" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                ជ្រើសប្រភព RSS
              </label>
              <select
                id="sourceId"
                value={ingestSourceId}
                onChange={(e) => setIngestSourceId(e.target.value)}
                disabled={ingestModal.open}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="ប្រភព RSS"
              >
                {ingestSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={openIngestModal}
              disabled={ingestModal.open || !ingestSourceId}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              ចាប់ផ្តើម AI Scraper
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
