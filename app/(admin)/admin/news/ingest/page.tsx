'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { NewsIngestProgressModal } from '@/components/admin/NewsIngestProgressModal';

type IngestSource = {
  id: string;
  label: string;
  feedUrl: string;
  allowedArticleHosts: string[];
  category: 'crypto' | 'forex';
  isActive: boolean;
};

type SourceForm = {
  id: string;
  label: string;
  feedUrl: string;
  allowedHostsText: string;
  category: 'crypto' | 'forex';
};

const defaultForm: SourceForm = {
  id: '',
  label: '',
  feedUrl: '',
  allowedHostsText: '',
  category: 'forex',
};

export default function AdminNewsIngestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingSource, setSavingSource] = useState(false);
  const [ingestSources, setIngestSources] = useState<IngestSource[]>([]);
  const [ingestSourceId, setIngestSourceId] = useState('');
  const [sourceForm, setSourceForm] = useState<SourceForm>(defaultForm);
  const [ingestModal, setIngestModal] = useState<{ open: boolean; runKey: number }>({
    open: false,
    runKey: 0,
  });

  const loadSources = async () => {
    const res = await fetch('/api/admin/news/ingest/sources');
    if (!res.ok) throw new Error('Failed to load sources');
    const data = await res.json();
    const sources = Array.isArray(data?.sources) ? (data.sources as IngestSource[]) : [];
    setIngestSources(sources.filter((s) => s.isActive));
    setIngestSourceId((id) => id || sources.find((s) => s.isActive)?.id || '');
  };

  useEffect(() => {
    let cancelled = false;
    loadSources()
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

  const handleAddSource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sourceForm.id || !sourceForm.label || !sourceForm.feedUrl) {
      toast.error('សូមបំពេញ id, label, និង feed URL');
      return;
    }

    const allowedArticleHosts = sourceForm.allowedHostsText
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    setSavingSource(true);
    try {
      const res = await fetch('/api/admin/news/ingest/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sourceForm.id.trim().toLowerCase(),
          label: sourceForm.label.trim(),
          feedUrl: sourceForm.feedUrl.trim(),
          allowedArticleHosts,
          category: sourceForm.category,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : 'រក្សាទុកប្រភពមិនបាន');
        return;
      }
      await loadSources();
      setSourceForm(defaultForm);
      toast.success('បានរក្សាទុកប្រភព RSS');
    } catch {
      toast.error('រក្សាទុកប្រភពមិនបាន');
    } finally {
      setSavingSource(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('លុបប្រភព RSS នេះមែនទេ?')) return;
    try {
      const res = await fetch('/api/admin/news/ingest/sources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : 'លុបប្រភពមិនបាន');
        return;
      }
      await loadSources();
      toast.success('បានលុបប្រភព RSS');
    } catch {
      toast.error('លុបប្រភពមិនបាន');
    }
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
                    {s.label} ({s.category})
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">បន្ថែមប្រភព RSS</h2>
          <form onSubmit={handleAddSource} className="mt-4 space-y-3">
            <input
              value={sourceForm.id}
              onChange={(e) => setSourceForm((s) => ({ ...s, id: e.target.value }))}
              placeholder="id (e.g. fxstreet-rss)"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
            <input
              value={sourceForm.label}
              onChange={(e) => setSourceForm((s) => ({ ...s, label: e.target.value }))}
              placeholder="Label"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
            <input
              value={sourceForm.feedUrl}
              onChange={(e) => setSourceForm((s) => ({ ...s, feedUrl: e.target.value }))}
              placeholder="https://example.com/rss"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
            <input
              value={sourceForm.allowedHostsText}
              onChange={(e) => setSourceForm((s) => ({ ...s, allowedHostsText: e.target.value }))}
              placeholder="Allowed hosts (comma separated), e.g. example.com,www.example.com"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
            <select
              value={sourceForm.category}
              onChange={(e) =>
                setSourceForm((s) => ({
                  ...s,
                  category: e.target.value === 'crypto' ? 'crypto' : 'forex',
                }))
              }
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
            >
              <option value="forex">forex</option>
              <option value="crypto">crypto</option>
            </select>
            <button
              type="submit"
              disabled={savingSource}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingSource ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកប្រភព'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ប្រភពដែលមាន</h2>
          <div className="mt-4 space-y-2">
            {ingestSources.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">មិនមានប្រភពទេ</p>
            ) : (
              ingestSources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{source.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{source.id} · {source.category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{source.feedUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSource(source.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    លុប
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
